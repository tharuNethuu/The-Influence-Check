import { useCallback, useMemo, useState } from "react";
import { QUESTIONS, INTRO, OUTRO, LOCAL_AUTHORITIES } from "./data/questions.js";
import QuestionCard, { OTHER_VALUE } from "./components/QuestionCard.jsx";
import ArrowButton from "./components/ArrowButton.jsx";
import IntroCard from "./components/IntroCard.jsx";
import OutroCard from "./components/OutroCard.jsx";
import { submitAnswers } from "./lib/submit.js";

const INTRO_INDEX = -1;
const OUTRO_INDEX = QUESTIONS.length;

function isAnswered(question, value, otherText) {
  if (!question) return true;
  const other = (otherText || "").trim();

  if (question.type === "multi") {
    const arr = Array.isArray(value) ? value : [];
    if (arr.length === 0) return false;
    if (arr.includes(OTHER_VALUE) && !other) return false;
    return true;
  }

  if (value === undefined || value === null || value === "") return false;
  if (value === OTHER_VALUE && !other) return false;
  return true;
}

export default function App() {
  const [index, setIndex] = useState(INTRO_INDEX);
  const [answers, setAnswers] = useState({}); // { [questionId]: value }
  const [otherTexts, setOtherTexts] = useState({}); // { [questionId]: string }
  const [wipePhase, setWipePhase] = useState("idle"); // idle | covering | revealing
  const [animating, setAnimating] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | submitting | success | error
  const [submitError, setSubmitError] = useState("");

  const rawQuestion = index >= 0 && index < QUESTIONS.length ? QUESTIONS[index] : null;

  // Resolve "dependsOn" dropdowns (e.g. city options depend on the chosen
  // district) into a concrete options array for this render.
  const currentQuestion = useMemo(() => {
    if (!rawQuestion) return null;
    if (!rawQuestion.dependsOn) return rawQuestion;
    const dependValue = answers[rawQuestion.dependsOn];
    return { ...rawQuestion, options: LOCAL_AUTHORITIES[dependValue] || [] };
  }, [rawQuestion, answers]);

  const currentBg =
    index === INTRO_INDEX
      ? INTRO.bg
      : index === OUTRO_INDEX
      ? OUTRO.bg
      : currentQuestion?.bg || null;

  const progressPct = useMemo(() => {
    if (index <= INTRO_INDEX) return 0;
    if (index >= QUESTIONS.length) return 100;
    return Math.round(((index + 1) / QUESTIONS.length) * 100);
  }, [index]);

  const goTo = useCallback(
    (nextIndex) => {
      if (animating) return;
      setAnimating(true);
      setWipePhase("covering");
      window.setTimeout(() => {
        setIndex(nextIndex);
        setWipePhase("revealing");
        window.setTimeout(() => {
          setWipePhase("idle");
          setAnimating(false);
        }, 420);
      }, 420);
    },
    [animating]
  );

  const handleChange = (value) => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const next = { ...prev, [currentQuestion.id]: value };
      // Clear any answer that depends on this question (e.g. the city
      // dropdown depends on the district — its old value no longer applies).
      QUESTIONS.forEach((q) => {
        if (q.dependsOn === currentQuestion.id && next[q.id] !== undefined) {
          delete next[q.id];
        }
      });
      return next;
    });
  };

  const handleOtherText = (text) => {
    if (!currentQuestion) return;
    setOtherTexts((prev) => ({ ...prev, [currentQuestion.id]: text }));
  };

  const buildFinalAnswers = () => {
    const out = {};
    for (const q of QUESTIONS) {
      let v = answers[q.id];
      if (v === undefined) {
        out[q.title] = "";
        continue;
      }
      if (q.type === "multi" && Array.isArray(v)) {
        v = v.map((item) => (item === OTHER_VALUE ? otherTexts[q.id] || "Other" : item)).join("; ");
      } else if (v === OTHER_VALUE) {
        v = otherTexts[q.id] || "Other";
      }
      out[q.title] = v;
    }
    return out;
  };

  const handleNext = async () => {
    if (index === INTRO_INDEX) {
      goTo(0);
      return;
    }

    if (index < QUESTIONS.length - 1) {
      goTo(index + 1);
      return;
    }

    // last question -> submit then show outro
    if (animating) return;
    setAnimating(true);
    setWipePhase("covering");
    window.setTimeout(async () => {
      setIndex(OUTRO_INDEX);
      setWipePhase("revealing");
      window.setTimeout(() => {
        setWipePhase("idle");
        setAnimating(false);
      }, 420);

      setSubmitStatus("submitting");
      try {
        await submitAnswers(buildFinalAnswers());
        setSubmitStatus("success");
      } catch (err) {
        setSubmitStatus("error");
        setSubmitError(err?.message || "unknown error");
      }
    }, 420);
  };

  const handleBack = () => {
    if (index === INTRO_INDEX || index === OUTRO_INDEX) return;
    if (index === 0) {
      goTo(INTRO_INDEX);
    } else {
      goTo(index - 1);
    }
  };

  const currentValue = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentOther = currentQuestion ? otherTexts[currentQuestion.id] : "";
  const canProceed =
    index === INTRO_INDEX ? true : isAnswered(currentQuestion, currentValue, currentOther);

  const stageStyle = currentBg
    ? { backgroundImage: `url(${currentBg})` }
    : undefined;

  return (
    <div className="stage" style={stageStyle}>
      {index !== INTRO_INDEX && index !== OUTRO_INDEX && (
        <div className="progress-track" style={{ width: `${progressPct}%` }} />
      )}

    

      <div className="page">
        <div className="page-content" key={index}>
          {index === INTRO_INDEX && <IntroCard intro={INTRO} onStart={handleNext} />}

          {currentQuestion && (
            <div className="glass-card">
              <span className="eyebrow">
                {currentQuestion.section} · Question {currentQuestion.number} of {QUESTIONS.length}
              </span>
              <h2 className="question-title">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && (
                <p className="question-subtitle">{currentQuestion.subtitle}</p>
              )}
              <QuestionCard
                question={currentQuestion}
                value={currentValue}
                otherText={currentOther}
                onChange={handleChange}
                onOtherText={handleOtherText}
              />
             <div className="nav-buttons">
              <ArrowButton
                direction="back"
                onClick={handleBack}
                disabled={index === 0 && index === INTRO_INDEX}
              />
              <ArrowButton direction="next" onClick={handleNext} disabled={!canProceed} />
            </div>
            </div>
          )}

          {index === OUTRO_INDEX && (
            <OutroCard outro={OUTRO} status={submitStatus} error={submitError} />
          )}
        </div>
      </div>

      {wipePhase !== "idle" && <div className={`wipe-overlay ${wipePhase === "covering" ? "cover" : "reveal"}`} />}
    </div>
  );
}