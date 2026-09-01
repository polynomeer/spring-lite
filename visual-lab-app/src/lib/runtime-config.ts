const configuredBaseUrl = import.meta.env.VITE_LAB_API_BASE_URL?.trim() ?? "";

export const liveApiBaseUrl = configuredBaseUrl.length > 0 ? configuredBaseUrl.replace(/\/+$/, "") : "";

export const liveTraceEndpointPath = "/lab/run/trace";

export const liveTraceEndpoint = liveApiBaseUrl
    ? `${liveApiBaseUrl}${liveTraceEndpointPath}`
    : liveTraceEndpointPath;

function configuredUrl(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed.replace(/\/+$/, "") : "";
}

export const springLiteCompareApiBaseUrl = configuredUrl(import.meta.env.VITE_SPRING_LITE_COMPARE_API_BASE_URL);
export const springBootCompareApiBaseUrl = configuredUrl(import.meta.env.VITE_SPRING_BOOT_COMPARE_API_BASE_URL);
export const comparisonTracePath = "/lab/compare/di";
export const springLiteCompareEndpoint = springLiteCompareApiBaseUrl
  ? `${springLiteCompareApiBaseUrl}${comparisonTracePath}`
  : `/compare-lite${comparisonTracePath}`;
export const springBootCompareEndpoint = springBootCompareApiBaseUrl
  ? `${springBootCompareApiBaseUrl}${comparisonTracePath}`
  : `/compare-boot${comparisonTracePath}`;
