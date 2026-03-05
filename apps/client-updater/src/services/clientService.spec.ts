import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    signOnService,
    advisorService,
    clientService,
    contextService
} from './clientService';

describe('Services', () => {
    describe('signOnService', () => {
        it('should get sign on info', async () => {
            const info = await signOnService.getSignOn();
            expect(info).toBeDefined();
            expect(info.role).toBe('support_staff'); // based on the .env mock role
        });
    });

    describe('advisorService', () => {
        it('should get advisor by ID if exists', async () => {
            const advisor = await advisorService.getAdvisorById('adv-1');
            expect(advisor).toEqual({ id: 'adv-1', name: 'Sarah Thompson' });
        });

        it('should return null for unknown advisor', async () => {
            const advisor = await advisorService.getAdvisorById('unknown');
            expect(advisor).toBeNull();
        });
    });

    describe('clientService', () => {
        beforeEach(async () => {
            // reset the mock data by setting a value back
            await clientService.updateClientField('c-1', 'name', 'Alice Johnson');
        });

        it('should fetch client by ID', async () => {
            const client = await clientService.getClientById('c-1');
            expect(client).toBeDefined();
            expect(client?.name).toBe('Alice Johnson');
        });

        it('should return null for unknown client', async () => {
            const client = await clientService.getClientById('unknown');
            expect(client).toBeNull();
        });

        it('should search clients scoped to advisor', async () => {
            const results = await clientService.searchClientsForAdvisor('adv-1', 'alice');
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('Alice Johnson');
        });

        it('should return empty array for advisor with no matching clients', async () => {
            const results = await clientService.searchClientsForAdvisor('adv-1', 'david');
            expect(results.length).toBe(0);
        });

        it('should return empty array for unknown advisor', async () => {
            const results = await clientService.searchClientsForAdvisor('unknown', 'alice');
            expect(results.length).toBe(0);
        });

        it('should update client field', async () => {
            const res = await clientService.updateClientField('c-1', 'name', 'Alice Updated');
            expect(res.success).toBe(true);

            const client = await clientService.getClientById('c-1');
            expect(client?.name).toBe('Alice Updated');
        });

        it('should fail to update unknown client', async () => {
            const res = await clientService.updateClientField('unknown', 'name', 'Updated');
            expect(res.success).toBe(false);
        });
    });

    describe('contextService', () => {
        it('should resolve context for both advisor and client', async () => {
            const ctx = await contextService.resolveContext('ctx-abc123');
            expect(ctx).toEqual({ clientId: 'c-1', advisorId: 'adv-1' });
        });

        it('should return null for unknown context', async () => {
            const ctx = await contextService.resolveContext('unknown');
            expect(ctx).toBeNull();
        });
    });
});
