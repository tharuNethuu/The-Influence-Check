export default function OutroCard({ outro, status, error }) {
  return (
    <div className="glass-card">
      <h1 className="intro-title">{outro.title}</h1>
      <p className="outro-body">{outro.body}</p>
      {status === "submitting" && (
        <div className="status-text">
          <span className="spinner" /> Saving your answers…
        </div>
      )}
      {status === "error" && (
        <div className="status-text error">
          Couldn't save automatically ({error || "network error"}). Your answers are still shown
          in the browser console.
        </div>
      )}
      {status === "success" && <div className="status-text">Your response has been recorded.</div>}
    </div>
  );
}
