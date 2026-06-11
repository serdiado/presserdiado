import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { billingService } from './billing.service.js';

const billingProfileTypeSchema = z.enum(['individual', 'corporate']);

const createBillingProfileSchema = z.object({
  type: billingProfileTypeSchema.default('corporate'),
  title: z.string().min(1).max(255),
  taxOffice: z.string().max(150).nullable().optional(),
  taxNumber: z.string().max(20).nullable().optional(),
  idNumber: z.string().max(11).nullable().optional(),
  invoiceAddress: z.string().min(1),
  shippingAddress: z.string().min(1),
  isDefault: z.boolean().default(false),
});

const updateBillingProfileSchema = createBillingProfileSchema.partial();

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export async function billingRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/billing-profiles', async (request, reply) => {
    const profiles = await billingService.getProfiles(request.user.id);
    return reply.send(profiles);
  });

  app.get('/billing-profiles/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const profile = await billingService.getProfileById(request.user.id, id);
    return reply.send(profile);
  });

  app.post('/billing-profiles', async (request, reply) => {
    const body = createBillingProfileSchema.parse(request.body);
    const profile = await billingService.createProfile(request.user.id, body);
    return reply.status(201).send(profile);
  });

  app.patch('/billing-profiles/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = updateBillingProfileSchema.parse(request.body);
    const profile = await billingService.updateProfile(request.user.id, id, body);
    return reply.send(profile);
  });

  app.delete('/billing-profiles/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await billingService.deleteProfile(request.user.id, id);
    return reply.status(204).send();
  });
}