import { apiFetch } from '@/lib/apiClient';

export type CreateCompany = {
	name: string;
}

export const createOrganisation = async (input: CreateCompany) => {
	try {
		const data = await apiFetch('/company', {
			method: 'POST',
			data: input,
		});

		if (data.status === "failed") {
			throw new Error(`API Failed: ${data.error}`);
		}

		return {
			status: "success",
			payload: data.payload || data,
		};
	} catch(err: any) {
		return {
			status: "failed",
			error: err.message || 'create organisation error',
		};
	}
}

export const fetchOrganisations = async () => {
	try {
		const response = await apiFetch('/company', {
			method: "GET"
		})

		if (response.status === "failed") throw new Error(`API failed: ${response.error}`);
		return response;
	}catch(err) {
		return {
			status: "failed",
			error: err instanceof Error ? err.message : 'unexpected  error'
		}
	}
}
