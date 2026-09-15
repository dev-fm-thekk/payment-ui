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

  create: async (name: string, email: string, serviceId: string): Promise<Client> => {
    const params = new URLSearchParams({ name, email, service_id: serviceId });
    const response = await apiClient.post('/client', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data?.data ?? response.data;
  },
};

