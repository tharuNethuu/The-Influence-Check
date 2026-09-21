export default function ArrowButton({ onClick, disabled, loading, direction = "next", ariaLabel }) {
  const label = ariaLabel || (direction === "back" ? "Back" : "Next");
  return (
    <button
      type="button"
      className="arrow-btn"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={label}
    >
      {loading ? (
        <span className="spinner" />
      ) : (
        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d={direction === "back" ? "M19 12H5M11 18l-6-6 6-6" : "M5 12h14M13 6l6 6-6 6"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}