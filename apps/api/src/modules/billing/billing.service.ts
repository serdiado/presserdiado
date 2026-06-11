import { randomUUID } from 'node:crypto';
import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { billingProfiles } from '../../db/schema/index.js';
import { NotFoundError } from '../../lib/errors.js';

export type BillingProfileType = 'individual' | 'corporate';

export interface CreateBillingProfileInput {
  type?: BillingProfileType;
  title: string;
  taxOffice?: string | null;
  taxNumber?: string | null;
  idNumber?: string | null;
  invoiceAddress: string;
  shippingAddress: string;
  isDefault?: boolean;
}

export type UpdateBillingProfileInput = Partial<CreateBillingProfileInput>;

const getAffectedRows = (result: unknown): number =>
  (result as [{ affectedRows?: number }])[0]?.affectedRows ?? 0;

export const billingService = {
  async createProfile(userId: string, data: CreateBillingProfileInput) {
    const id = randomUUID();

    await db.transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx
          .update(billingProfiles)
          .set({ isDefault: false })
          .where(eq(billingProfiles.userId, userId));
      }

      await tx.insert(billingProfiles).values({
        id,
        userId,
        type: data.type ?? 'corporate',
        title: data.title,
        taxOffice: data.taxOffice ?? null,
        taxNumber: data.taxNumber ?? null,
        idNumber: data.idNumber ?? null,
        invoiceAddress: data.invoiceAddress,
        shippingAddress: data.shippingAddress,
        isDefault: data.isDefault ?? false,
      });
    });

    return this.getProfileById(userId, id);
  },

  async getProfiles(userId: string) {
    return db
      .select()
      .from(billingProfiles)
      .where(eq(billingProfiles.userId, userId))
      .orderBy(desc(billingProfiles.isDefault), desc(billingProfiles.updatedAt));
  },

  async getProfileById(userId: string, profileId: string) {
    const profile = await db.query.billingProfiles.findFirst({
      where: and(eq(billingProfiles.id, profileId), eq(billingProfiles.userId, userId)),
    });

    if (!profile) throw new NotFoundError('Fatura profili bulunamadı');
    return profile;
  },

  async updateProfile(userId: string, profileId: string, data: UpdateBillingProfileInput) {
    const values: Partial<typeof billingProfiles.$inferInsert> = {};

    if (data.type !== undefined) values.type = data.type;
    if (data.title !== undefined) values.title = data.title;
    if (data.taxOffice !== undefined) values.taxOffice = data.taxOffice;
    if (data.taxNumber !== undefined) values.taxNumber = data.taxNumber;
    if (data.idNumber !== undefined) values.idNumber = data.idNumber;
    if (data.invoiceAddress !== undefined) values.invoiceAddress = data.invoiceAddress;
    if (data.shippingAddress !== undefined) values.shippingAddress = data.shippingAddress;
    if (data.isDefault !== undefined) values.isDefault = data.isDefault;

    if (Object.keys(values).length === 0) {
      return this.getProfileById(userId, profileId);
    }

    await db.transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx
          .update(billingProfiles)
          .set({ isDefault: false })
          .where(and(eq(billingProfiles.userId, userId), ne(billingProfiles.id, profileId)));
      }

      const result = await tx
        .update(billingProfiles)
        .set(values)
        .where(and(eq(billingProfiles.id, profileId), eq(billingProfiles.userId, userId)));

      const affected = getAffectedRows(result);
      if (affected === 0) throw new NotFoundError('Fatura profili bulunamadı');
    });

    return this.getProfileById(userId, profileId);
  },

  async deleteProfile(userId: string, profileId: string) {
    const result = await db
      .delete(billingProfiles)
      .where(and(eq(billingProfiles.id, profileId), eq(billingProfiles.userId, userId)));

    const affected = getAffectedRows(result);
    if (affected === 0) throw new NotFoundError('Fatura profili bulunamadı');
  },
};