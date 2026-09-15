import { apiClient } from '@/lib/api-client';

export interface Service {
  id: string;
  companyId: string;
  name: string;
  currency: string;
  [key: string]: unknown;
}

export const serviceService = {
  getByCompany: async (companyId: string): Promise<Service[]> => {
    const response = await apiClient.get(`/service/company/${companyId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  },

  create: async (companyId: string, name: string, currency: string): Promise<Service> => {
    const params = new URLSearchParams({ companyId, name, currency });
    const response = await apiClient.post('/service', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data?.data ?? response.data;
  },
};

