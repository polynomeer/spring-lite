const configuredBaseUrl = import.meta.env.VITE_LAB_API_BASE_URL?.trim() ?? "";

export const liveApiBaseUrl = configuredBaseUrl.length > 0 ? configuredBaseUrl.replace(/\/+$/, "") : null;

export const liveTraceEndpointPath = "/lab/run/trace";

export const liveTraceEndpoint = liveApiBaseUrl ? `${liveApiBaseUrl}${liveTraceEndpointPath}` : null;
