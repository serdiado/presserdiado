import { randomUUID } from 'node:crypto';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { projects } from '../../db/schema/index.js';
import { NotFoundError } from '../../lib/errors.js';
import { generateSlots } from '@matbaapro/grid-engine';

interface CreateProjectInput {
  name: string;
  productTypeId: string;
  canvasData: Record<string, unknown>;
  printConfig?: Record<string, unknown>;
}

interface CanvasFormaShape {
  pages?: { id: string; grid?: { cols: number; rows: number }; slots?: unknown[] }[];
}
interface CanvasShape {
  formas?: CanvasFormaShape[];
}

export const projectService = {
  async listByUser(userId: string) {
    return db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  },

  async getById(userId: string, id: string) {
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, userId)),
    });
    if (!project) throw new NotFoundError('Proje bulunamadı');
    return project;
  },

  async create(userId: string, input: CreateProjectInput) {
    const canvasData = input.canvasData as CanvasShape;
    if (canvasData.formas) {
      for (const forma of canvasData.formas) {
        for (const page of forma.pages ?? []) {
          if (page.grid && (!page.slots || page.slots.length === 0)) {
            page.slots = generateSlots(page.id, page.grid);
          }
        }
      }
    }

    const id = randomUUID();
    await db.insert(projects).values({
      id,
      userId,
      name: input.name,
      productTypeId: input.productTypeId,
      canvasData: canvasData as Record<string, unknown>,
      printConfig: input.printConfig ?? {},
    });

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });
    if (!project) throw new Error('Insert failed');
    return project;
  },

  async updateCanvas(userId: string, id: string, canvasData: Record<string, unknown>) {
    const where = and(eq(projects.id, id), eq(projects.userId, userId));
    const result = await db
      .update(projects)
      .set({
        canvasData,
        autoSavedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      })
      .where(where);
    const affected = (result as unknown as [{ affectedRows: number }])[0]?.affectedRows ?? 0;
    if (affected === 0) throw new NotFoundError('Proje bulunamadı');

    const project = await db.query.projects.findFirst({ where });
    if (!project) throw new NotFoundError('Proje bulunamadı');
    return project;
  },

  async remove(userId: string, id: string) {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
    const affected = (result as unknown as [{ affectedRows: number }])[0]?.affectedRows ?? 0;
    if (affected === 0) throw new NotFoundError('Proje bulunamadı');
  },
};
