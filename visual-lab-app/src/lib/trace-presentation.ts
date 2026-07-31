import { type Locale } from "./i18n";
import type { LabTrace, TraceEventKind } from "./types";

export type TraceTone = "success" | "info" | "warning" | "error";

export interface TraceStatusSummary {
  tone: TraceTone;
  label: string;
  detail: string;
}

const severityRank: Record<TraceTone, number> = {
  success: 0,
  info: 1,
  warning: 2,
  error: 3
};

function toneFromEventKind(kind: TraceEventKind): TraceTone {
  if (kind === "error") {
    return "error";
  }
  if (kind === "warning") {
    return "warning";
  }
  if (kind === "info") {
    return "info";
  }
  return "success";
}

export function deriveTraceTone(trace: LabTrace): TraceTone {
  return trace.steps.reduce<TraceTone>((current, step) => {
    const candidate = toneFromEventKind(step.kind);
    return severityRank[candidate] > severityRank[current] ? candidate : current;
  }, "success");
}

export function deriveTraceStatusSummary(trace: LabTrace, locale: Locale = "en"): TraceStatusSummary {
  const tone = deriveTraceTone(trace);
  const ko = locale === "ko";
  if (tone === "error") {
    return {
      tone,
      label: ko ? "실패 경로" : "Failure Path",
      detail: ko ? "현재 trace는 오류 또는 rollback 분기로 종료됩니다." : "The active trace exits through an error or rollback branch."
    };
  }
  if (tone === "warning") {
    return {
      tone,
      label: ko ? "주의 경로" : "Degraded Path",
      detail: ko ? "rollback-only나 작업 생략 같은 주의 신호와 함께 trace가 진행됩니다." : "The trace completes with caution signals such as rollback-only or skipped work."
    };
  }
  if (tone === "info") {
    return {
      tone,
      label: ko ? "관찰 경로" : "Observation Path",
      detail: ko ? "현재 trace는 설명 목적이 강하고 흐름 가시화에 초점이 있습니다." : "The trace is primarily explanatory and focuses on flow visibility."
    };
  }
  return {
    tone,
    label: ko ? "정상 경로" : "Healthy Path",
    detail: ko ? "경고나 오류 없이 성공 경로를 따라가는 trace입니다." : "The trace follows a successful execution path with no warning or error edges."
  };
}
