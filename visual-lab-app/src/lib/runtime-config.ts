const configuredBaseUrl = import.meta.env.VITE_LAB_API_BASE_URL?.trim() ?? "";

export const liveApiBaseUrl = configuredBaseUrl.length > 0 ? configuredBaseUrl.replace(/\/+$/, "") : "";

export const liveTraceEndpointPath = "/lab/run/trace";

export const liveTraceEndpoint = liveApiBaseUrl
    ? `${liveApiBaseUrl}${liveTraceEndpointPath}`
    : liveTraceEndpointPath;
