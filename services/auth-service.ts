import { apiClient } from '@/lib/api-client';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  passwordHash: string; // The endpoint expects passwordHash, could just send password depending on backend
  name: string;
  role: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    // The swagger doc specifies application/x-www-form-urlencoded, so we format data accordingly
    const data = new URLSearchParams();
    data.append('email', credentials.email);
    if (credentials.password) data.append('password', credentials.password);
    
    const response = await apiClient.post('/auth/login', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },
  
  register: async (credentials: RegisterCredentials) => {
    const data = new URLSearchParams();
    data.append('email', credentials.email);
    data.append('passwordHash', credentials.passwordHash);
    data.append('name', credentials.name);
    data.append('role', credentials.role);

    const response = await apiClient.post('/user/register', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error("Logout error", error);
    }
  }
};
