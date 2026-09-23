import { useState } from "react";
import ArrowButton from "./ArrowButton.jsx";

export default function IntroCard({ intro, onStart }) {
  const [showResearcher, setShowResearcher] = useState(false);

  return (
    <>
      <div className="glass-card">
        <h1 className="intro-title">{intro.title}</h1>
        <p className="intro-body">{intro.body}</p>

        {/* Start Here button - uses existing arrow button styling */}
        <button
          className="arrow-btn"
          onClick={() => setShowResearcher(true)}
          aria-label="Start here"
          style={{
            width: "110px",
            borderRadius: "20px",
            fontSize: "12px",
          }}
        >
          START HERE
        </button>
      </div>

      {/* Researcher details popup */}
      {showResearcher && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background: "rgba(0, 0, 0, 0.45)",
          }}
        >
          <div className="glass-card">
            <span className="eyebrow">RESEARCH INFORMATION</span>

            <h2 className="question-title">
            </h2>

            <p className="intro-body">
             Hi! I'm Imesh Aravindu, a final-year undergraduate pursuing a Bachelor of Management Studies Honours Degree in Marketing Management at the Open University of Sri Lanka.
             {"\n"}{"\n"}
             For my final year research project, I'm investigating the impact of influencer marketing on brand trust and purchase intention among Generation Z consumers in the Sri Lankan hospitality industry.
             {"\n"}{"\n"} All information provided will be kept strictly confidential and used solely for academic purposes. Your participation is entirely voluntary, and your responses will be treated with the utmost privacy and anonymity.
             {"\n"}{"\n"}Thank you for your valuable time and support.
            </p>

            {/* Existing reusable ArrowButton stays unchanged */}
            <ArrowButton
              direction="next"
              onClick={onStart}
              ariaLabel="Continue to questionnaire"
            />
          </div>
        </div>
      )}
    </>
  );
}