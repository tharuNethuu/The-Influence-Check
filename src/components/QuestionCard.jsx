import { SCALE_OPTIONS } from "../data/questions.js";

const OTHER_VALUE = "__OTHER__";

export default function QuestionCard({ question, value, otherText, onChange, onOtherText }) {
  const { type, options } = question;

  if (type === "email" || type === "text") {
    return (
      <input
        className="other-input"
        type={type === "email" ? "email" : "text"}
        inputMode={type === "email" ? "email" : "text"}
        placeholder={type === "email" ? "you@example.com" : "Type your answer"}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    );
  }

  if (type === "single") {
    return (
      <div className="options">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={"option-btn" + (value === opt ? " selected" : "")}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
        {question.allowOther && (
          <>
            <button
              type="button"
              className={"option-btn" + (value === OTHER_VALUE ? " selected" : "")}
              onClick={() => onChange(OTHER_VALUE)}
            >
              Other
            </button>
            {value === OTHER_VALUE && (
              <input
                className="other-input"
                type="text"
                placeholder="Please specify"
                value={otherText || ""}
                onChange={(e) => onOtherText(e.target.value)}
                autoFocus
              />
            )}
          </>
        )}
      </div>
    );
  }

  if (type === "multi") {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt) => {
      if (selected.includes(opt)) {
        onChange(selected.filter((o) => o !== opt));
      } else {
        onChange([...selected, opt]);
      }
    };
    const otherSelected = selected.includes(OTHER_VALUE);
    return (
      <div className="options">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={"option-btn" + (selected.includes(opt) ? " selected" : "")}
            onClick={() => toggle(opt)}
          >
            <span className="option-check">{selected.includes(opt) ? "✓" : ""}</span>
            {opt}
          </button>
        ))}
        {question.allowOther && (
          <>
            <button
              type="button"
              className={"option-btn" + (otherSelected ? " selected" : "")}
              onClick={() => toggle(OTHER_VALUE)}
            >
              <span className="option-check">{otherSelected ? "✓" : ""}</span>
              Other
            </button>
            {otherSelected && (
              <input
                className="other-input"
                type="text"
                placeholder="Please specify"
                value={otherText || ""}
                onChange={(e) => onOtherText(e.target.value)}
                autoFocus
              />
            )}
          </>
        )}
      </div>
    );
  }

  if (type === "scale") {
    return (
      <div className="scale-options">
        {SCALE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={"scale-btn" + (value === opt.value ? " selected" : "")}
            onClick={() => onChange(opt.value)}
          >
            <span className="scale-num">{opt.value}</span>
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (type === "dropdown") {
    const opts = options || [];
    if (question.dependsOn && opts.length === 0) {
      return (
        <p className="question-subtitle" style={{ margin: 0 }}>
          Please go back and pick a district first.
        </p>
      );
    }
    return (
      <select
        className="dropdown-select"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          {question.placeholder || "Select an option"}
        </option>
        {opts.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return null;
}

export { OTHER_VALUE };