// URL of the deployed Google Apps Script Web App (see /apps-script/Code.gs + README.md).
// Set VITE_GOOGLE_SCRIPT_URL in a .env file, e.g.:
// VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
const ENDPOINT = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

// Google Apps Script Web Apps don't return CORS headers, so the browser can't
// read the response when we call it directly from fetch(). We use mode:
// "no-cors", which still delivers the POST to the script (Apps Script appends
// the row) but gives us an opaque response we can't inspect. That mirrors how
// a native Google Form submits.
export async function submitAnswers(answersObject) {
  if (!ENDPOINT) {
    console.warn(
      "VITE_GOOGLE_SCRIPT_URL is not set — answers were NOT sent to Google Sheets. " +
        "See README.md for setup instructions."
    );
    console.info("Survey answers:", answersObject);
    throw new Error("Google Sheet endpoint not configured");
  }

  const payload = {
    timestamp: new Date().toISOString(),
    answers: answersObject,
  };

  await fetch(ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  // With no-cors we can't verify the response, so we optimistically resolve.
  return true;
}
