const configuredBaseUrl = import.meta.env.VITE_LAB_API_BASE_URL?.trim() ?? "";

export const liveApiBaseUrl = configuredBaseUrl.length > 0 ? configuredBaseUrl.replace(/\/+$/, "") : "";

export const liveTraceEndpointPath = "/lab/run/trace";

export const liveTraceEndpoint = liveApiBaseUrl
    ? `${liveApiBaseUrl}${liveTraceEndpointPath}`
    : liveTraceEndpointPath;

export const liveEventsEndpointPath = "/lab/run/events";

export const liveEventsEndpoint = liveApiBaseUrl
    ? `${liveApiBaseUrl}${liveEventsEndpointPath}`
    : liveEventsEndpointPath;

function configuredUrl(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed.replace(/\/+$/, "") : "";
}

export const springLiteCompareApiBaseUrl = configuredUrl(import.meta.env.VITE_SPRING_LITE_COMPARE_API_BASE_URL);
export const springBootCompareApiBaseUrl = configuredUrl(import.meta.env.VITE_SPRING_BOOT_COMPARE_API_BASE_URL);

export function comparisonTracePath(scenario: string) {
  return `/lab/compare/${scenario}`;
}

export function springLiteCompareEndpoint(scenario: string) {
  const path = comparisonTracePath(scenario);
  return springLiteCompareApiBaseUrl ? `${springLiteCompareApiBaseUrl}${path}` : `/compare-lite${path}`;
}

export function springBootCompareEndpoint(scenario: string) {
  const path = comparisonTracePath(scenario);
  return springBootCompareApiBaseUrl ? `${springBootCompareApiBaseUrl}${path}` : `/compare-boot${path}`;
}
