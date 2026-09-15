import { apiClient } from '@/lib/api-client';

export interface Invoice {
  id: string;
  title: string;
  description: string;
  clientId: string;
  amount: string;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'expired';
  dueDate: string;
  paymentLinkId?: string;
  [key: string]: unknown;
}

export const invoiceService = {
  getByClient: async (clientId: string): Promise<Invoice[]> => {
    const response = await apiClient.get(`/invoice/client/${clientId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  },
  create: async (data: Omit<Invoice, 'id' | 'status'> & { status?: string }): Promise<Invoice> => {
    const response = await apiClient.post('/invoice', data);
    return response.data?.data ?? response.data;
  },
  notify: async (id: string): Promise<void> => {
    await apiClient.post(`/invoice/notify/${id}`);
  },
};
