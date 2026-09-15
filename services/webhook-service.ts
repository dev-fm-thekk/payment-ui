import { apiClient } from '@/lib/api-client';

export interface WebhookEndpoint {
  id: string;
  companyId: string;
  provider: string;
  endpointToken?: string;
  [key: string]: unknown;
}

export interface WebhookEventLog {
  id: string;
  webhookId: string;
  eventType?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export const webhookService = {
  getByCompanyAndProvider: async (companyId: string, provider: string): Promise<WebhookEndpoint[]> => {
    const response = await apiClient.get(`/webhook/${companyId}/${provider}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  },

  getLogs: async (webhookId: string): Promise<WebhookEventLog[]> => {
    const response = await apiClient.get(`/webhook/event/logs/${webhookId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  },

  create: async (companyId: string, provider: string): Promise<WebhookEndpoint> => {
    const params = new URLSearchParams({ companyId, provider });
    const response = await apiClient.post('/webhook', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data?.data ?? response.data;
  },
};

