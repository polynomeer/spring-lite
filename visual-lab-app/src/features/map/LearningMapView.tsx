import { useState } from "react";
import { loadPredictions } from "../../lib/prediction-store";
import { loadProgress, rememberLastStep, setStepCompleted } from "../../lib/progress-store";
import {
  continueTarget,
  overallProgress,
  stageLabels,
  stages,
  stepKey,
  stepStatuses,
  tracks,
  type LearningStep
} from "./learning-map";
import "./map.css";

const statusLabels = { done: "완료", current: "진행 중", todo: "남음" } as const;

export function LearningMapView() {
  const [progress, setProgress] = useState(loadProgress);
  const [predictions] = useState(loadPredictions);

  const resume = continueTarget(progress);
  const overall = overallProgress(progress);
  const wrong = predictions.filter((record) => !record.correct).length;

  const open = (track: string, index: number) => setProgress(rememberLastStep(track, index));

  const stepAction = (track: string, index: number, step: LearningStep, primary = false) =>
    step.href ? (
      <a className={`lab-button${primary ? " primary" : ""}`} href={step.href} onClick={() => open(track, index)}>
        {step.action ?? "열기"}
      </a>
    ) : (
      <span className="map-reading">읽을 곳 <code>{step.reading}</code></span>
    );

  return (
    <div className="map-page">
      <section className="map-head">
        <div>
          <p className="map-crumb">학습 지도</p>
          <h1>Spring을 직접 만들며 배우는 여덟 갈래 길</h1>
          <p className="map-lede">
            트랙마다 개념 → 구현 → 실험 → 비교 네 단계를 돈다. 실험 화면에서 예측하고 실행한 기록은 자동으로 진행도에 반영되고, 읽기·구현 단계는 직접 완료 표시를 한다.
          </p>
        </div>
        <p className="map-overall" aria-label="전체 진행도">
          <strong>{overall.done}</strong> / {overall.total} 단계
        </p>
      </section>

      <div className="map-top">
        {resume ? (
          <section className="map-panel map-continue" aria-labelledby="map-continue">
            <p className="map-crumb">이어서 하기</p>
            <h2 id="map-continue">{resume.track.title} · {stageLabels[resume.step.stage]} — {resume.step.title}</h2>
            <p>{stages.find((stage) => stage.id === resume.step.stage)?.summary}</p>
            <div className="map-continue-actions">
              {stepAction(resume.track.id, resume.index, resume.step, true)}
              {!resume.step.href && (
                <button type="button" className="lab-button primary" onClick={() => setProgress(setStepCompleted(stepKey(resume.track.id, resume.index), true))}>
                  읽었다, 다음으로
                </button>
              )}
            </div>
          </section>
        ) : (
          <section className="map-panel map-continue">
            <p className="map-crumb">이어서 하기</p>
            <h2>모든 단계를 마쳤다</h2>
            <p>복습 노트에서 틀렸던 예측을 다시 풀어 보자.</p>
          </section>
        )}

        <section className="map-panel map-review-teaser" aria-labelledby="map-review">
          <p className="map-crumb">복습 노트</p>
          <h2 id="map-review">{wrong > 0 ? `틀린 예측 ${wrong}개` : predictions.length > 0 ? "틀린 예측이 없다" : "아직 예측 기록이 없다"}</h2>
          <p>예측 {predictions.length}개 중 {predictions.length - wrong}개를 맞혔다. 틀린 예측은 복습 카드가 된다.</p>
          <a className="lab-button" href="#/review">복습 노트 열기</a>
        </section>
      </div>

      <section aria-labelledby="map-tracks">
        <h2 id="map-tracks" className="map-section-title">트랙</h2>
        <div className="map-grid">
          {tracks.map((track) => {
            const statuses = stepStatuses(progress, track);
            return (
              <article key={track.id} className="map-track" aria-labelledby={`track-${track.id}`}>
                <header>
                  <h3 id={`track-${track.id}`}>{track.title}</h3>
                  <span>{track.subtitle}</span>
                </header>
                <div className="map-bar" aria-label={`${statuses.filter((status) => status === "done").length} / ${statuses.length} 단계 완료`}>
                  {statuses.map((status, index) => <span key={index} className={`is-${status}`} />)}
                </div>
                <ol className="map-steps">
                  {track.steps.map((step, index) => {
                    const status = statuses[index];
                    const key = stepKey(track.id, index);
                    const manual = progress.completed.includes(key);
                    return (
                      <li key={key} className={`is-${status}`}>
                        <div className="map-step-title">
                          <span className="map-stage">{stageLabels[step.stage]}</span>
                          <span>{step.title}</span>
                          <span className="map-status">{statusLabels[status]}</span>
                        </div>
                        <div className="map-step-actions">
                          {stepAction(track.id, index, step)}
                          {(status !== "done" || manual) && (
                            <button
                              type="button"
                              className="map-check"
                              aria-pressed={manual}
                              onClick={() => setProgress(setStepCompleted(key, !manual))}
                            >
                              {manual ? "완료 취소" : "완료 표시"}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </article>
            );
          })}
        </div>
      </section>

      <section className="map-panel" aria-labelledby="map-loop">
        <h2 id="map-loop">학습 루프</h2>
        <ol className="map-loop">
          {stages.map((stage, index) => (
            <li key={stage.id}>
              <strong>{index + 1} {stage.label}</strong>
              <span>{stage.summary}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
