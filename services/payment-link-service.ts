import { apiClient } from '@/lib/api-client';

export interface PaymentLink {
  id: string;
  companyId: string;
  provider: string;
  url: string;
  status: 'active' | 'expired' | 'consumed';
  expiresAt: string;
  amount?: number;
  currency?: string;
  description?: string;
  [key: string]: unknown;
}

export const paymentLinkService = {
  getByCompany: async (companyId: string): Promise<PaymentLink[]> => {
    const response = await apiClient.get(`/payment-link/company/${companyId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  },

  create: async (payload: {
    amount: number;
    currency: string;
    provider?: string;
    providerId?: string;
    company?: string;
    companyId?: string;
    upi_link?: boolean;
    description?: string;
  }): Promise<PaymentLink> => {
    const response = await apiClient.post('/payment-link', payload);
    return response.data?.data ?? response.data.record;
  },
};

