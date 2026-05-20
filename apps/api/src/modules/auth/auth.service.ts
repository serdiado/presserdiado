import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../lib/errors.js';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '@matbaapro/shared';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_TYPE = 'refresh' as const;

interface RegisterInput {
  email: string;
  password: string;
  companyName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function generateTokens(app: FastifyInstance, userId: string) {
  const accessToken = app.jwt.sign({ id: userId }, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = app.jwt.sign(
    { id: userId, type: REFRESH_TOKEN_TYPE },
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput, app: FastifyInstance) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (existing) {
      throw new ConflictError('Bu e-posta adresi zaten kayıtlı');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const id = randomUUID();

    await db.insert(users).values({
      id,
      email: input.email,
      passwordHash,
      companyName: input.companyName ?? null,
    });

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { id: true, email: true, companyName: true, createdAt: true },
    });
    if (!user) throw new Error('Insert failed');

    const tokens = generateTokens(app, user.id);

    return {
      ...tokens,
      user,
    };
  },

  async login(input: LoginInput, app: FastifyInstance) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (!user) {
      throw new UnauthorizedError('E-posta veya şifre hatalı');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('E-posta veya şifre hatalı');
    }

    const tokens = generateTokens(app, user.id);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        createdAt: user.createdAt,
      },
    };
  },

  async refresh(refreshToken: string, app: FastifyInstance) {
    let payload: { id: string; type?: string };
    try {
      payload = app.jwt.verify<{ id: string; type?: string }>(refreshToken);
    } catch (err) {
      app.log.debug(err, 'Token verification failed');
      throw new UnauthorizedError('Geçersiz veya süresi dolmuş token');
    }

    if (payload.type !== REFRESH_TOKEN_TYPE) {
      throw new UnauthorizedError('Geçersiz token');
    }

    return generateTokens(app, payload.id);
  },

  async getProfile(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        companyName: true,
        defaultPrintPrefs: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı');
    }

    return user;
  },
};
