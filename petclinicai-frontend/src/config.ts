const envBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = envBase !== undefined && envBase !== null && envBase !== ''
	? envBase
	: (import.meta.env.DEV ? '' : 'http://localhost:5259');
