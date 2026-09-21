/**
 * Google Apps Script Web App that receives POSTed survey answers and
 * appends them as a new row in the bound Google Sheet — the same way
 * a Google Form writes its responses.
 *
 * SETUP
 * 1. Create (or open) a Google Sheet that will hold the responses.
 * 2. In the Sheet, go to Extensions > Apps Script.
 * 3. Delete any boilerplate code and paste this whole file in.
 * 4. Click Deploy > New deployment.
 *    - Select type: "Web app".
 *    - Execute as: "Me".
 *    - Who has access: "Anyone".
 * 5. Click Deploy, authorize the script, and copy the Web App URL.
 * 6. Put that URL in the React app's .env file as:
 *    VITE_GOOGLE_SCRIPT_URL=<the web app URL>
 *
 * The first submission creates a header row automatically from the
 * question text (in the same order questions were answered), with a
 * "Timestamp" column first.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var answers = payload.answers || {};
    var timestamp = payload.timestamp || new Date().toISOString();

    var questionKeys = Object.keys(answers);

    // Write header row on first-ever submission.
    if (sheet.getLastRow() === 0) {
      var header = ["Timestamp"].concat(questionKeys);
      sheet.appendRow(header);
    }

    // Always append values in the same column order as the header.
    var headerRow = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    var row = headerRow.map(function (col) {
      if (col === "Timestamp") return timestamp;
      return Object.prototype.hasOwnProperty.call(answers, col) ? answers[col] : "";
    });

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ result: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(
    "This is a POST-only endpoint for the influencer trust survey."
  );
}
