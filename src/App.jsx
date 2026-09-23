import { useCallback, useMemo, useState } from "react";
import { QUESTIONS, INTRO, OUTRO, LOCAL_AUTHORITIES } from "./data/questions.js";
import QuestionCard, { OTHER_VALUE } from "./components/QuestionCard.jsx";
import ArrowButton from "./components/ArrowButton.jsx";
import IntroCard from "./components/IntroCard.jsx";
import OutroCard from "./components/OutroCard.jsx";
import { submitAnswers } from "./lib/submit.js";

const INTRO_INDEX = -1;

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

// Group the flat QUESTIONS list into sections, preserving first-seen order.
function buildSections(questions) {
  const sections = [];
  const bySection = new Map();
  questions.forEach((q) => {
    const key = q.section || "General";
    if (!bySection.has(key)) {
      const section = { title: key, questions: [] };
      bySection.set(key, section);
      sections.push(section);
    }
    bySection.get(key).questions.push(q);
  });
  return sections.map((s, i) => ({ ...s, number: String(i + 1).padStart(2, "0") }));
}

export default function App() {
  const SECTIONS = useMemo(() => buildSections(QUESTIONS), []);
  const OUTRO_INDEX = SECTIONS.length;

  const [index, setIndex] = useState(INTRO_INDEX); // -1 intro, 0..n-1 sections, n outro
  const [answers, setAnswers] = useState({});
  const [otherTexts, setOtherTexts] = useState({});
  const [wipePhase, setWipePhase] = useState("idle");
  const [animating, setAnimating] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");

  const currentSection = index >= 0 && index < SECTIONS.length ? SECTIONS[index] : null;
  const failedScreening =
  answers.q_screen_age === "No" ||
  answers.q_screen_follows === "No";

  // Resolve "dependsOn" dropdowns for every question in the current section.
  const resolvedQuestions = useMemo(() => {
    if (!currentSection) return [];
    return currentSection.questions.map((q) => {
      if (!q.dependsOn) return q;
      const dependValue = answers[q.dependsOn];
      return { ...q, options: LOCAL_AUTHORITIES[dependValue] || [] };
    });
  }, [currentSection, answers]);

  // Background video: intro gets homebg.mp4, everything else gets bg.mp4.
  const bgVideoSrc = index === INTRO_INDEX ? "/homebg.mp4" : "/bg.mp4";

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

  const handleChange = (question, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [question.id]: value };
      QUESTIONS.forEach((q) => {
        if (q.dependsOn === question.id && next[q.id] !== undefined) {
          delete next[q.id];
        }
      });
      return next;
    });
  };

  const handleOtherText = (question, text) => {
    setOtherTexts((prev) => ({ ...prev, [question.id]: text }));
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

  const finishSurvey = async () => {
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

 const handleNext = async () => {
  if (index === INTRO_INDEX) {
    goTo(0);
    return;
  }

  // Screening failed -> end questionnaire
  if (currentSection?.title === "Screening" && failedScreening) {
    await finishSurvey();
    return;
  }

  if (index < SECTIONS.length - 1) {
    goTo(index + 1);
    return;
  }

  // Final section -> submit and finish
  await finishSurvey();
};

  const handleBack = () => {
    if (index === INTRO_INDEX || index === OUTRO_INDEX) return;
    if (index === 0) {
      goTo(INTRO_INDEX);
    } else {
      goTo(index - 1);
    }
  };

  const canProceed =
    index === INTRO_INDEX
      ? true
      : resolvedQuestions.every((q) => isAnswered(q, answers[q.id], otherTexts[q.id]));

  return (
    <div className="stage">
      <video
        key={bgVideoSrc}
        className="bg-video"
        src={bgVideoSrc}
        autoPlay
        muted
        loop
        playsInline
      />

    {index === INTRO_INDEX ? (
  <div className="intro-page" key={index}>
    <IntroCard intro={INTRO} onStart={handleNext} />
  </div>
) : (
  <div className="page">
    <div className="page-content" key={index}>
      {currentSection && (
        <div className="glass-card">
          <span className="eyebrow">
            {currentSection.number} · {currentSection.title}
          </span>

          <div className="section-questions">
            {resolvedQuestions.map((q) => (
              <div className="section-question-block" key={q.id}>
                <h2 className="question-title">{q.title}</h2>
                {q.subtitle && <p className="question-subtitle">{q.subtitle}</p>}
                <QuestionCard
                  question={q}
                  value={answers[q.id]}
                  otherText={otherTexts[q.id]}
                  onChange={(value) => handleChange(q, value)}
                  onOtherText={(text) => handleOtherText(q, text)}
                />
              </div>
            ))}
          </div>

          <div className="nav-buttons">
            <ArrowButton direction="back" onClick={handleBack} disabled={false} />
            <ArrowButton direction="next" onClick={handleNext} disabled={!canProceed} />
          </div>
        </div>
      )}

      {index === OUTRO_INDEX && (
        <OutroCard outro={OUTRO} status={submitStatus} error={submitError} />
      )}
    </div>
  </div>
)}

      {wipePhase !== "idle" && (
        <div className={`wipe-overlay ${wipePhase === "covering" ? "cover" : "reveal"}`} />
      )}
    </div>
  );
}