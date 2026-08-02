import { apiFetch } from '@/lib/apiClient';

type Service = {
	id: string,
	companyId: string,
	name: string,
	currency: string,
};

export const fetchServices = async (companyId: string) => {
	try {
		const path = `/service/company/${companyId}/`;
		const data = await apiFetch(path, {
			method: "GET"
		})
                
		console.log("Fetch result: ", data);
		if (data.status === "failed") throw new Error(data.error);
		return data;
	} catch(err) {
		let message = err instanceof Error ? err.message : 'unexpected error';
		return {
			status: 'failed',
			reason: message
		}
	}
}

export const addService = async (service: Omit<Service, "id">) => {
	try {
		const path = `/service/`;
		const data = await apiFetch(path, {
			method: "POST",
			data: service
		})
		if (data.status === "failed") throw new Error(data.error);
		console.log(data);
		return data;
	} catch(err) {
		let message = err instanceof Error ? err.message : 'unexpected error';
		return {
			status: 'failed',
			reason: message
		}
	}
}
