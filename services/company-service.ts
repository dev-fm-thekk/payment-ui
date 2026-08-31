import { apiClient } from '@/lib/api-client';

export interface Company {
  id: string;
  name: string;
}

export const companyService = {
  getCompanies: async (): Promise<Company[]> => {
    const response = await apiClient.get('/company');
    // Ensure we return an array whether the API wraps it in a data object or not
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  }
};
