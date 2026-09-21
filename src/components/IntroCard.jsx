import ArrowButton from "./ArrowButton.jsx";

export default function IntroCard({ intro, onStart }) {
  return (
    <div className="glass-card">
      <h1 className="intro-title">{intro.title}</h1>
      <p className="intro-body">{intro.body}</p>
      <ArrowButton onClick={onStart} ariaLabel={intro.cta} />
    </div>
  );
}
