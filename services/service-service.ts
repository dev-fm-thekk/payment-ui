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
};
