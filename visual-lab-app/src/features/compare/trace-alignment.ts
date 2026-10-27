import type { ComparisonTraceEvent } from "../../lib/types";

export type Verdict = "same" | "simplified" | "missing";

export interface AlignedRow {
  step: string;
  lite?: ComparisonTraceEvent;
  boot?: ComparisonTraceEvent;
}

/**
 * Lines up two event paths by their normalized step names using the longest common subsequence,
 * so shared steps share a row and a step only one runtime takes gets a row with an empty side.
 */
export function alignTraces(lite: ComparisonTraceEvent[], boot: ComparisonTraceEvent[]): AlignedRow[] {
  const lengths = Array.from({ length: lite.length + 1 }, () => new Array<number>(boot.length + 1).fill(0));
  for (let i = lite.length - 1; i >= 0; i -= 1) {
    for (let j = boot.length - 1; j >= 0; j -= 1) {
      lengths[i][j] = lite[i].step === boot[j].step
        ? lengths[i + 1][j + 1] + 1
        : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }
  const rows: AlignedRow[] = [];
  let i = 0;
  let j = 0;
  while (i < lite.length || j < boot.length) {
    if (i < lite.length && j < boot.length && lite[i].step === boot[j].step) {
      rows.push({ step: lite[i].step, lite: lite[i], boot: boot[j] });
      i += 1;
      j += 1;
    } else if (j < boot.length && (i >= lite.length || lengths[i][j + 1] >= lengths[i + 1][j])) {
      rows.push({ step: boot[j].step, boot: boot[j] });
      j += 1;
    } else {
      rows.push({ step: lite[i].step, lite: lite[i] });
      i += 1;
    }
  }
  return rows;
}

interface StepInfo {
  label: string;
  explain: string;
  /** How spring-lite compares when only Spring takes this step. */
  verdict?: Exclude<Verdict, "same">;
}

const stepInfo: Record<string, StepInfo> = {
  "call.enter": { label: "프록시 진입", explain: "호출이 @Transactional 프록시에 들어온다. 두 런타임 모두 여기서 트랜잭션 속성을 읽는다." },
  "tx.begin": { label: "트랜잭션 시작", explain: "커넥션을 얻어 auto-commit을 끄고 현재 스레드에 묶는다." },
  "tx.sync.register": {
    label: "동기화 등록",
    explain: "Spring은 새 트랜잭션마다 TransactionSynchronization 목록을 연다. 커밋 뒤 이벤트 발행·캐시 정리 같은 작업을 트랜잭션 결말에 묶는 확장 지점인데, spring-lite에는 이 장치가 없다.",
    verdict: "missing"
  },
  "jdbc.insert": { label: "INSERT 실행", explain: "트랜잭션에 묶인 같은 커넥션으로 insert를 실행한다." },
  "jdbc.select": { label: "SELECT 실행", explain: "방금 넣은 행을 같은 커넥션에서 다시 읽는다. 아직 커밋 전이지만 같은 트랜잭션이라 보인다." },
  "call.return": { label: "메서드 정상 반환", explain: "대상 메서드가 값을 돌려주었다. 인터셉터는 이제 커밋을 요청한다." },
  "call.throw": { label: "메서드 예외", explain: "대상 메서드가 예외를 던졌다. 인터셉터가 롤백 규칙(rollbackFor)으로 롤백 여부를 정한다." },
  "tx.sync.before-commit": {
    label: "beforeCommit 콜백",
    explain: "커밋 직전에 등록된 동기화에게 알린다. JPA라면 여기서 flush가 일어난다. spring-lite에는 없다.",
    verdict: "missing"
  },
  "tx.sync.before-completion": {
    label: "beforeCompletion 콜백",
    explain: "커밋이든 롤백이든 끝나기 직전에 알린다. 리소스 정리 준비에 쓰인다. spring-lite에는 없다.",
    verdict: "missing"
  },
  "tx.commit": { label: "커밋", explain: "Connection.commit()으로 변경을 반영한다." },
  "tx.rollback": { label: "롤백", explain: "Connection.rollback()으로 insert를 되돌린다." },
  "tx.sync.after-commit": {
    label: "afterCommit 콜백",
    explain: "커밋이 성공한 뒤에만 불린다. @TransactionalEventListener(AFTER_COMMIT)가 이 지점을 쓴다. spring-lite에는 없다.",
    verdict: "missing"
  },
  "tx.sync.after-completion": {
    label: "afterCompletion 콜백",
    explain: "결말(커밋·롤백)을 상태 값으로 알려 준다. spring-lite에는 없다.",
    verdict: "missing"
  },
  "tx.cleanup": {
    label: "커넥션 정리",
    explain: "커넥션을 스레드에서 떼고 auto-commit을 되돌린 뒤 풀에 반납한다. spring-lite도 트랜잭션이 끝나면 커넥션을 닫지만 별도 이벤트로 남기지 않는다.",
    verdict: "simplified"
  }
};

export function stepLabel(step: string): string {
  return stepInfo[step]?.label ?? step;
}

export function stepExplain(step: string): string {
  return stepInfo[step]?.explain ?? "두 런타임의 정규화 단계 이름이다.";
}

/** Shared rows are the same; a row only Spring has takes the step's documented verdict. */
export function rowVerdict(row: AlignedRow): Verdict {
  if (row.lite && row.boot) {
    return "same";
  }
  return stepInfo[row.step]?.verdict ?? (row.lite ? "simplified" : "missing");
}

export const verdictLabels: Record<Verdict, string> = {
  same: "같음",
  simplified: "단순화",
  missing: "미구현"
};
