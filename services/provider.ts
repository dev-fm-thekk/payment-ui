import { apiFetch } from "@/lib/apiClient"

type Provider = {
    id: string,
    credentialsEncrypted: {
        apiKey: string,
        apiSecret: string
    },
    serviceId: string,
    provider: "razorpay" | "stripe"
}

export const addProvider = async (provider: Omit<Provider, "id">) => {
    try {
        const response = await apiFetch('/provider', {
            method: 'POST',
            data: provider
        })

        if (response.status == "failed") throw new Error(response.error);
        
        return response;
    } catch(err) {
        return { 
            status: 'failed',
            reason: err instanceof Error ? err.message : 'unexpected error',
        }
    }
}

export const fetchProviders = async (serviceId: string) => {
    try {
        let response = await apiFetch(`/provider/service/${serviceId}`, {
            method: "GET",
        })

        if (response.status == "failed") throw new Error(response.error);
        return response.data[0];
    } catch(err) {
        return {
            status: "failed",
            reason: err instanceof Error ? err.message : 'unexpected error'
        }
    }
}