import type { ContainerBean, TraceEventView } from "../../lib/types";

const FRAMEWORK_PACKAGES = [
  "lite.spring.core.",
  "lite.spring.context.",
  "lite.spring.aop.",
  "lite.spring.tx.",
  "lite.spring.jdbc.",
  "lite.spring.web.",
  "lite.spring.boot.",
  "javax.",
  "java."
];

/** Application beans are the example's own types; framework and auto-configured beans are infrastructure. */
export function isApplicationBean(bean: ContainerBean): boolean {
  if (bean.definitionKind === "CONFIGURATION" && bean.typeName.includes("AutoConfiguration")) {
    return false;
  }
  return !FRAMEWORK_PACKAGES.some((prefix) => bean.typeName.startsWith(prefix));
}

export const NODE_WIDTH = 208;
export const NODE_HEIGHT = 56;
const COLUMN_GAP = 88;
const ROW_GAP = 18;
const PADDING = 16;

export interface PositionedBean {
  bean: ContainerBean;
  x: number;
  y: number;
}

export interface GraphLayout {
  nodes: PositionedBean[];
  edges: { from: string; to: string }[];
  width: number;
  height: number;
}

/**
 * Layers beans left to right: a bean sits one column left of the deepest bean it depends on, so
 * dependencies always point rightwards and leaves (no dependencies) end up in the last column.
 */
export function layoutGraph(beans: ContainerBean[]): GraphLayout {
  const byName = new Map(beans.map((bean) => [bean.name, bean]));
  const levels = new Map<string, number>();
  const levelOf = (name: string, visiting: Set<string>): number => {
    const cached = levels.get(name);
    if (cached !== undefined) {
      return cached;
    }
    if (visiting.has(name)) {
      return 0;
    }
    visiting.add(name);
    const deps = (byName.get(name)?.dependencies ?? []).filter((dep) => byName.has(dep));
    const level = deps.length === 0 ? 0 : 1 + Math.max(...deps.map((dep) => levelOf(dep, visiting)));
    visiting.delete(name);
    levels.set(name, level);
    return level;
  };
  beans.forEach((bean) => levelOf(bean.name, new Set()));

  const maxLevel = Math.max(0, ...levels.values());
  const columns = new Map<number, ContainerBean[]>();
  beans.forEach((bean) => {
    const column = maxLevel - (levels.get(bean.name) ?? 0);
    columns.set(column, [...(columns.get(column) ?? []), bean]);
  });

  const nodes: PositionedBean[] = [];
  let tallest = 0;
  [...columns.entries()].sort(([a], [b]) => a - b).forEach(([column, members]) => {
    members.forEach((bean, row) => {
      nodes.push({
        bean,
        x: PADDING + column * (NODE_WIDTH + COLUMN_GAP),
        y: PADDING + row * (NODE_HEIGHT + ROW_GAP)
      });
    });
    tallest = Math.max(tallest, members.length);
  });

  const edges = beans.flatMap((bean) =>
    bean.dependencies.filter((dep) => byName.has(dep)).map((dep) => ({ from: bean.name, to: dep }))
  );

  return {
    nodes,
    edges,
    width: PADDING * 2 + (maxLevel + 1) * NODE_WIDTH + maxLevel * COLUMN_GAP,
    height: PADDING * 2 + tallest * NODE_HEIGHT + Math.max(0, tallest - 1) * ROW_GAP
  };
}

export const lifecycleLabels: Record<string, string> = {
  create: "생성 시작",
  instantiate: "생성자·@Bean 호출",
  aware: "Aware 콜백",
  init: "@PostConstruct",
  "post-process": "후처리",
  ready: "컨테이너에 노출",
  cycle: "순환 참조"
};

export function eventsForBean(refresh: TraceEventView[], beanName: string): TraceEventView[] {
  return refresh.filter((event) => event.layer === "container" && event.attributes.bean === beanName);
}

/** Bean names in the order the container started creating them. */
export function creationOrder(refresh: TraceEventView[]): string[] {
  return refresh
    .filter((event) => event.layer === "container" && event.kind === "create")
    .map((event) => event.attributes.bean);
}

export interface ProcessorResult {
  processor: string;
  replaced: boolean;
}

export function processorResults(refresh: TraceEventView[], beanName: string): ProcessorResult[] {
  const postProcess = eventsForBean(refresh, beanName).find((event) => event.kind === "post-process");
  const raw = postProcess?.attributes.processors ?? "";
  return raw
    .split(",")
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const [processor, result] = entry.split(":");
      return { processor, replaced: result === "replaced" };
    });
}

export const definitionKindLabels: Record<ContainerBean["definitionKind"], string> = {
  COMPONENT: "@Component",
  CONFIGURATION: "@Configuration",
  INFRASTRUCTURE: "인프라",
  FACTORY_METHOD: "@Bean"
};
