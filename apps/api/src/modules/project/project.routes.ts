import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { projectService } from './project.service.js';

const createProjectSchema = z.object({
  name: z.string().min(1),
  productTypeId: z.string().uuid(),
  canvasData: z.record(z.unknown()),
  printConfig: z.record(z.unknown()).optional(),
});

const updateCanvasSchema = z.object({
  canvasData: z.record(z.unknown()),
});

export async function projectRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/projects', async (request, reply) => {
    const projects = await projectService.listByUser(request.user.id);
    return reply.send(projects);
  });

  app.get('/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await projectService.getById(request.user.id, id);
    return reply.send(project);
  });

  app.post('/projects', async (request, reply) => {
    const body = createProjectSchema.parse(request.body);
    const project = await projectService.create(request.user.id, body);
    return reply.status(201).send(project);
  });

  app.patch('/projects/:id/canvas', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateCanvasSchema.parse(request.body);
    const project = await projectService.updateCanvas(request.user.id, id, body.canvasData);
    return reply.send(project);
  });

  app.delete('/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await projectService.remove(request.user.id, id);
    return reply.status(204).send();
  });
}
