import { describe, it, expect, beforeEach } from 'vitest';
import {
  signOnService,
  advisorService,
  clientService,
  contextService,
} from './index';

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
      // reset the mock data by setting the name back
      await clientService.updateClientSection('c-1', 'name', {
        firstName: 'Alice',
        lastName: 'Johnson',
        middleName: 'Marie',
      });
    });

    it('should fetch client by ID', async () => {
      const client = await clientService.getClientById('c-1');
      expect(client).toBeDefined();
      expect(client?.clientNameDetails.firstName).toBe('Alice');
      expect(client?.clientNameDetails.lastName).toBe('Johnson');
    });

    it('should return null for unknown client', async () => {
      const client = await clientService.getClientById('unknown');
      expect(client).toBeNull();
    });

    it('should search clients scoped to advisor', async () => {
      const results = await clientService.searchClientsForAdvisor(
        'adv-1',
        'alice',
      );
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Alice Marie Johnson');
    });

    it('should return empty array for advisor with no matching clients', async () => {
      const results = await clientService.searchClientsForAdvisor(
        'adv-1',
        'david',
      );
      expect(results.length).toBe(0);
    });

    it('should return empty array for unknown advisor', async () => {
      const results = await clientService.searchClientsForAdvisor(
        'unknown',
        'alice',
      );
      expect(results.length).toBe(0);
    });

    it('should update client section', async () => {
      const res = await clientService.updateClientSection('c-1', 'name', {
        firstName: 'Alice',
        lastName: 'Updated',
        middleName: 'Marie',
      });
      expect(res.success).toBe(true);

      const client = await clientService.getClientById('c-1');
      expect(client?.clientNameDetails.lastName).toBe('Updated');
    });

    it('should fail to update unknown client', async () => {
      const res = await clientService.updateClientSection('unknown', 'name', {
        firstName: 'X',
        lastName: 'Y',
        middleName: '',
      });
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
