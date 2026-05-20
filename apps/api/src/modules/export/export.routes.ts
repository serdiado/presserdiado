import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { exportCatalog, type ExportFormat } from './export.service.js';

const ExportSchema = z.object({
  formaIds: z.array(z.number()).min(1),
  format: z.enum(['pdf', 'png', 'jpeg']),
  catalogState: z.record(z.unknown()),
  layerState: z.record(z.unknown()).nullable().optional(),
});

export async function exportRoutes(app: FastifyInstance) {
  app.post(
    '/export',
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const body = ExportSchema.parse(req.body);
      const result = await exportCatalog({
        formaIds: body.formaIds,
        format: body.format as ExportFormat,
        catalogState: body.catalogState as Parameters<typeof exportCatalog>[0]['catalogState'],
        layerState: (body.layerState as { layers: unknown[] } | null) ?? null,
      });

      reply
        .header('Content-Type', result.contentType)
        .header('Content-Disposition', `attachment; filename="${result.filename}"`)
        .send(result.buffer);
    },
  );
}
