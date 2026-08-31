import { apiClient } from '@/lib/api-client';

export interface Client {
  id: string;
  name: string;
  email: string;
  serviceId: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export const clientService = {
  getByService: async (serviceId: string): Promise<Client[]> => {
    const response = await apiClient.get(`/client/${serviceId}`);
    const rawClients = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.payload ?? response.data?.data ?? []);
      
    return rawClients.map((client: any) => ({
      ...client,
      serviceId: client.service_id || client.serviceId,
    }));
  },
};
