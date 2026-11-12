/**
 * Ichilov HOME — server-side intake for an approved research environment.
 *
 * SETUP: In a separate Google Apps Script project, set Script Properties:
 *   SPREADSHEET_ID   — ID of the approved research spreadsheet
 *   NOTIFY_EMAIL     — approved destination (notification only; no answers)
 *   INGEST_TOKEN     — high-entropy secret held ONLY by an approved server-side proxy
 *
 * SECURITY: Do not put INGEST_TOKEN in a public GitHub Pages site or its JavaScript.
 * Not production-ready for direct public browser requests. Use a reviewed server
 * endpoint with abuse controls, consent/institutional approval and secure storage.
 */
const ROUTES = Object.freeze({
  "short:patient": { sheet: "קצר_מטופל", count: 8 },
  "short:family": { sheet: "קצר_משפחה", count: 8 },
  "interview:patient": { sheet: "עומק_מטופל", count: 16 },
  "interview:family": { sheet: "עומק_משפחה", count: 16 }
});
function result_(status, message) {
  return ContentService.createTextOutput(JSON.stringify({status, message}))
    .setMimeType(ContentService.MimeType.JSON);
}
function value_(input, max) {
  if (input == null) return "";
  if (typeof input !== "string") throw new Error("Field must be a string");
  const v = input.trim();
  if (v.length > max) throw new Error("Field exceeds allowed length");
  // Prevent Sheets formula injection, including after leading spaces.
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function doGet() {
  return result_("disabled", "This endpoint does not accept data by GET.");
}
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents ||
        e.postData.contents.length > 80000) {
      return result_("rejected", "Invalid payload");
    }
    const props = PropertiesService.getScriptProperties();
    const expected = props.getProperty("INGEST_TOKEN");
    const spreadsheetId = props.getProperty("SPREADSHEET_ID");
    const notify = props.getProperty("NOTIFY_EMAIL");
    // Fail closed if deployment has not been configured.
    if (!expected || expected.length < 32 || !spreadsheetId || !notify) {
      return result_("disabled", "Intake is not configured");
    }
    const data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return result_("rejected", "Invalid payload");
    }
    if (typeof data.token !== "string" || data.token !== expected) {
      return result_("rejected", "Authorization failed");
    }
    const mode = value_(data.mode, 20);
    const type = value_(data.type, 20);
    const route = ROUTES[mode + ":" + type];
    if (!route || !Array.isArray(data.answers) ||
        data.answers.length !== route.count) {
      return result_("rejected", "Invalid questionnaire route");
    }
    // Additional governance checks must occur BEFORE production rollout.
    if (data.test !== true) {
      return result_("disabled", "Only synthetic test submissions are permitted");
    }
    const code = value_(data.code, 24);
    const stage = value_(data.stage, 50);
    const answers = data.answers.map(v => value_(v, mode === "short" ? 2000 : 5000));
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) return result_("retry", "Intake busy");
    let receipt;
    try {
      const book = SpreadsheetApp.openById(spreadsheetId);
      const sheet = book.getSheetByName(route.sheet);
      if (!sheet) return result_("disabled", "Destination tab missing");
      receipt = Utilities.getUuid();
      sheet.appendRow([new Date(), receipt, mode, type, code, stage].concat(answers));
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
    // Email receives metadata only; no answer content, diagnoses or identifiers.
    try {
      MailApp.sendEmail(
        notify,
        "Ichilov HOME — התקבלה תשובת בדיקה",
        "נרשמה תשובת דמה לטבלת המחקר.\n" +
        "מסלול: " + mode + " / " + type + "\n" +
        "אסמכתה: " + receipt + "\n" +
        "זהו מייל התראה בלבד; אין בו תוכן תשובות."
      );
    } catch (mailError) {
      // Successful storage must not be mistaken for an email delivery guarantee.
      console.error("Mail notification failed: " + mailError.message);
    }
    return result_("accepted_test", "Synthetic test submission stored");
  } catch (error) {
    console.error("Intake rejected: " + error.message);
    return result_("rejected", "Invalid request");
  }
}
