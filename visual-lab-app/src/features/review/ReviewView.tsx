import { useState } from "react";
import { loadPredictions } from "../../lib/prediction-store";
import { loadReviews, saveReview } from "../../lib/review-store";
import {
  REVIEW_INTERVALS,
  answerLabel,
  buildCards,
  conceptFor,
  isDue,
  isMastered,
  nextSchedule,
  scenarioLabel,
  todayKey,
  weakConcepts
} from "./review-model";
import "../replay/replay.css";
import "./review.css";

const sourceLabels: Record<string, string> = { static: "리플레이 · 정적", live: "리플레이 · live", sandbox: "샌드박스" };

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ReviewView() {
  const [predictions] = useState(loadPredictions);
  const [reviews, setReviews] = useState(loadReviews);
  const [revealed, setRevealed] = useState(false);
  const [wrongOnly, setWrongOnly] = useState(false);

  const today = todayKey();
  const cards = buildCards(predictions);
  const dueCards = cards.filter((card) => isDue(reviews[card.id], today));
  const mastered = cards.filter((card) => isMastered(reviews[card.id])).length;
  const card = dueCards[0];
  const weak = weakConcepts(predictions);
  const log = [...predictions].reverse().filter((record) => !wrongOnly || !record.correct);
  const correctCount = predictions.filter((record) => record.correct).length;

  const grade = (remembered: boolean) => {
    if (!card) {
      return;
    }
    setReviews(saveReview(card.id, nextSchedule(reviews[card.id], remembered, today)));
    setRevealed(false);
  };

  return (
    <div className="review-page">
      <section className="review-head">
        <div>
          <p className="review-crumb">학습 지도 · 복습 노트</p>
          <h1>틀렸던 예측을 다시 꺼내 보는 곳</h1>
          <p className="review-lede">
            리플레이와 샌드박스에서 틀린 예측은 복습 카드가 된다. 답을 먼저 떠올린 뒤 펼치고, 기억났는지에 따라 다음 복습일이 {REVIEW_INTERVALS.join("·")}일 간격으로 늘어난다. 기록은 이 브라우저에만 저장된다.
          </p>
        </div>
        <dl className="review-stats">
          <div><dt>예측</dt><dd>{predictions.length}</dd></div>
          <div><dt>적중</dt><dd>{correctCount}</dd></div>
          <div><dt>오늘 복습</dt><dd>{dueCards.length}</dd></div>
          <div><dt>익힌 카드</dt><dd>{mastered}</dd></div>
        </dl>
      </section>

      <div className="review-top">
        <section className="review-panel review-today" aria-labelledby="review-today">
          <h2 id="review-today">오늘의 복습{dueCards.length > 0 ? ` · ${dueCards.length}장 남음` : ""}</h2>
          {card ? (
            <div className="review-card">
              <p className="review-card-meta">
                {card.concept.label} · {sourceLabels[card.record.source] ?? card.record.source} · {scenarioLabel(card.record)}
                {card.misses > 1 ? ` · ${card.misses}번 틀림` : ""}
              </p>
              <p className="review-question">{card.record.question}</p>
              {revealed ? (
                <>
                  <dl className="replay-attributes">
                    <div><dt>내 예측</dt><dd className="review-wrong">{answerLabel(card.record.choice)}</dd></div>
                    <div><dt>실제 결과</dt><dd className="review-right">{answerLabel(card.record.answer)}</dd></div>
                  </dl>
                  <p className="review-point">{card.concept.point}</p>
                  <div className="review-actions">
                    <button type="button" className="lab-button primary" onClick={() => grade(true)}>기억났다</button>
                    <button type="button" className="lab-button" onClick={() => grade(false)}>다시 볼래</button>
                    <a className="review-link" href={card.concept.href}>{card.concept.action}</a>
                  </div>
                </>
              ) : (
                <div className="review-actions">
                  <button type="button" className="lab-button primary" onClick={() => setRevealed(true)}>답을 떠올렸다, 펼치기</button>
                </div>
              )}
            </div>
          ) : (
            <p className="replay-empty">
              {cards.length === 0
                ? "복습할 카드가 없다. 리플레이나 샌드박스에서 예측을 틀리면 여기에 카드가 생긴다."
                : "오늘 볼 카드를 모두 끝냈다. 다음 복습일에 다시 나타난다."}
            </p>
          )}
        </section>

        <section className="review-panel" aria-labelledby="review-weak">
          <h2 id="review-weak">약한 개념</h2>
          {weak.length === 0 ? (
            <p className="replay-empty">아직 틀린 예측이 없다.</p>
          ) : (
            <ol className="review-weak">
              {weak.map((entry) => (
                <li key={entry.concept.id}>
                  <div className="review-weak-head">
                    <strong>{entry.concept.label}</strong>
                    <span>{entry.misses} / {entry.attempts} 틀림</span>
                  </div>
                  <div className="review-weak-bar" aria-hidden="true">
                    <span style={{ width: `${(entry.misses / entry.attempts) * 100}%` }} />
                  </div>
                  <a className="review-link" href={entry.concept.href}>{entry.concept.action}</a>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="review-panel" aria-labelledby="review-log">
        <div className="review-log-head">
          <h2 id="review-log">예측 기록</h2>
          <label className="replay-toggle">
            <input type="checkbox" checked={wrongOnly} onChange={(event) => setWrongOnly(event.target.checked)} />
            틀린 것만
          </label>
        </div>
        {log.length === 0 ? (
          <p className="replay-empty">{predictions.length === 0 ? "아직 예측 기록이 없다." : "틀린 예측이 없다."}</p>
        ) : (
          <div className="review-table-scroll">
            <table className="review-table">
              <thead>
                <tr><th>시각</th><th>실험</th><th>질문</th><th>내 예측</th><th>실제</th><th>판정</th><th /></tr>
              </thead>
              <tbody>
                {log.map((record, index) => (
                  <tr key={`${record.at}-${index}`}>
                    <td>{formatTime(record.at)}</td>
                    <td>{sourceLabels[record.source] ?? record.source}<br /><small>{scenarioLabel(record)} · {conceptFor(record).label}</small></td>
                    <td>{record.question}</td>
                    <td>{answerLabel(record.choice)}</td>
                    <td>{answerLabel(record.answer)}</td>
                    <td className={record.correct ? "review-right" : "review-wrong"}>{record.correct ? "맞음" : "틀림"}</td>
                    <td><a className="review-link" href={record.source === "sandbox" ? "#/sandbox" : "#/replay"}>다시 실행</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
