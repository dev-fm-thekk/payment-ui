import { apiClient } from '@/lib/api-client';

export interface PaymentLink {
  id: string;
  companyId: string;
  provider: string;
  url: string;
  status: 'active' | 'expired' | 'consumed';
  expiresAt: string;
  [key: string]: unknown;
}

export const paymentLinkService = {
  getByCompany: async (companyId: string): Promise<PaymentLink[]> => {
    const response = await apiClient.get(`/payment-link/company/${companyId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  },

  create: async (
    companyId: string,
    provider: string,
    url: string,
    expiresAt: string,
  ): Promise<PaymentLink> => {
    const response = await apiClient.post('/payment-link', { companyId, provider, url, expiresAt });
    return response.data?.data ?? response.data;
  },
};

