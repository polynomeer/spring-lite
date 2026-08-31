import type { LabLane, LabStep, TraceLaneKind } from "../../lib/types";

function includesAny(text: string, fragments: string[]) {
  return fragments.some((fragment) => text.includes(fragment));
}

export function inferRelatedLaneKinds(step: LabStep): TraceLaneKind[] {
  const haystack = `${step.id} ${step.title} ${step.detail} ${step.marker}`.toLowerCase();
  const kinds = new Set<TraceLaneKind>();

  if (includesAny(haystack, ["dispatch", "route", "bind", "valid", "json", "response", "controller", "request"])) {
    kinds.add("web");
  }
  if (includesAny(haystack, ["service", "orderservice", "createorder", "failforlab", "getorder", "throw"])) {
    kinds.add("service");
  }
  if (includesAny(haystack, ["tx", "transaction", "begin()", "commit()", "rollback()", "rollbackonly"])) {
    kinds.add("tx");
  }
  if (includesAny(haystack, ["jdbc", "repository", "insert", "select", "sql", "row"])) {
    kinds.add("jdbc");
  }
  if (includesAny(haystack, ["bean", "bootstrap", "instantiate", "post-process", "proxy"])) {
    kinds.add("container");
  }
  if (includesAny(haystack, ["spring", "comparison", "lite"])) {
    kinds.add("compare");
  }

  if (kinds.size === 0) {
    kinds.add("generic");
  }

  return [...kinds];
}

export function isLaneRelatedToStep(lane: LabLane, step: LabStep | null): boolean {
  if (!step) {
    return false;
  }
  const relatedKinds = inferRelatedLaneKinds(step);
  return relatedKinds.includes(lane.kind);
}
