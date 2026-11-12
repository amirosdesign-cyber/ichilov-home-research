/**
 * HIT — מחקר חוויית אשפוז ביתי
 * יצירת שני Google Forms מקוצרים לפי קובץ השאלונים שסופק.
 *
 * HOW TO RUN: Open your research Google Sheet > Extensions > Apps Script;
 * add a NEW script file called GoogleFormsSetup.gs and paste this file.
 * Select createShortResearchForms from Run dropdown. Authorize prompts.
 *
 * The script DOES NOT create/change any patient records and does not
 * submit answers. It creates Google Forms using the current account,
 * saves them to the project-only Drive folder and links their
 * responses to the existing research spreadsheet.
 *
 * Form links are printed to the Apps Script execution log.
 */
const HIT_SHORT_FORMS = {
  folderId: '1SgTZxN1IhktqNWzgd-_tnuzDTznUHRb7',
  spreadsheetId: '1KYVYhWHubT-V_BgmT-pjAImbbh4jIxd8AT7zSo2a4qg',
  notifyEmail: 'amiros.design@gmail.com',
  propertyPrefix: 'HIT_SHORT_FORM_',
  patient: {
    title: 'מחקר חוויית אשפוז ביתי | HIT — שאלון מקוצר למטופלים',
    description: 'אנחנו צוות סטודנטים לתואר שני בעיצוב ב־HIT, החוקרים חוויות של אשפוז ביתי בבתי חולים שונים. השאלון מיועד למי שנמצא/ת כעת באשפוז ביתי או סיים/ה אשפוז ביתי. ההשתתפות מרצון, אפשר לדלג על כל שאלת תוכן ואפשר להפסיק בכל רגע. אין למסור שמות, פרטי קשר, אבחנות, תוצאות בדיקות או מידע רפואי אישי. השאלון אינו מספק מענה רפואי. התשובות יישמרו בחשבון המחקר המחובר לטופס, בהתאם להסדרי הפרטיות והאישורים החלים.',
    questions: [
      {q:'באיזה שלב של האשפוז הביתי את/ה נמצא/ת?', a:['נמצא/ת כעת באשפוז ביתי','סיימתי אשפוז ביתי']},
      {q:'כאשר הוצגה לך האפשרות לאשפוז בבית, מה היה לך ברור לגבי התהליך?',multi:true,a:['מי אחראי על הטיפול בי','כיצד יתבצע הטיפול בבית','מתי ואיך אפשר לפנות לצוות','מה נדרש ממני או מבני משפחתי','אף אחד מהדברים האלה לא היה ברור לי','לא זוכר/ת']},
      {q:'באילו דרכים קיבלת מידע או עדכונים במהלך האשפוז?',multi:true,a:['בשיחה עם אנשי הצוות בבית','בשיחת טלפון','בהודעות לטלפון','במסמכים מודפסים','באמצעות אתר או אפליקציה','דרך בן/בת משפחה','אחר']},
      {q:'בפעם האחרונה שהייתה לך שאלה או דאגה הקשורה לאשפוז, מה עשית קודם?',a:['פניתי ישירות לצוות הרפואי','שאלתי בן/בת משפחה','חיפשתי במידע שקיבלתי','חיפשתי מידע באינטרנט','המתנתי לביקור או לשיחה הבאה','לא ידעתי למי לפנות','לא התעורר מצב כזה','אחר']},
      {q:'באילו מצבים, אם בכלל, נתקלת בקושי במהלך האשפוז?',multi:true,a:['להבין את הנחיות הטיפול','לקבל מידע על בדיקות או תוצאות','ליצור קשר עם הצוות','להשתמש בציוד או במכשירים','להתארגן בבית בהתאם לטיפול','להבין מה צפוי בהמשך','לא נתקלתי בקושי','אחר']},
      {q:'כאשר נדרשת לבצע פעולה הקשורה לטיפול בבית, כיצד פעלת בדרך כלל?',a:['פעלתי לפי ההנחיות שקיבלתי','נעזרתי בבן/בת משפחה','ביקשתי הסבר נוסף מהצוות','חיפשתי מידע נוסף בעצמי','לא נדרשתי לבצע פעולות בעצמי','אחר']},
      {q:'מה מהבאים סייע לך במהלך האשפוז בבית?',multi:true,a:['ביקורים ושיחות עם אנשי הצוות','הנחיות ברורות','עזרה של בני משפחה או חברים','ציוד או אמצעים שהיו זמינים בבית','האפשרות לפנות לצוות בעת הצורך','לא היה גורם מסוים שסייע לי','אחר']},
      {q:'האם יש משהו נוסף שחשוב לך לספר על חוויית האשפוז בבית?',open:true}
    ]
  },
  family: {
    title: 'מחקר חוויית אשפוז ביתי | HIT — שאלון מקוצר לבני משפחה ומלווים',
    description: 'אנחנו צוות סטודנטים לתואר שני בעיצוב ב־HIT, החוקרים חוויות של אשפוז ביתי בבתי חולים שונים. השאלון מיועד לבני משפחה ולאנשים שליוו מטופל/ת באשפוז ביתי. ההשתתפות מרצון, אפשר לדלג על שאלות ואפשר להפסיק בכל רגע. אין למסור שמות, פרטי קשר, אבחנות, תוצאות בדיקות או מידע רפואי של המטופל/ת. השאלון אינו מספק מענה רפואי. התשובות יישמרו בחשבון המחקר המחובר לטופס, בהתאם להסדרי הפרטיות והאישורים החלים.',
    questions: [
      {q:'מה הייתה מידת המעורבות שלך במהלך האשפוז הביתי?',a:['הייתי מעורב/ת מדי יום','הייתי מעורב/ת כמה פעמים בשבוע','הייתי מעורב/ת רק במצבים מסוימים','הייתי מעורב/ת מעט מאוד']},
      {q:'באילו פעולות היית מעורב/ת בפועל?',multi:true,a:['תקשורת עם הצוות הרפואי','סיוע בקבלת תרופות או במעקב אחר הנחיות','שימוש בציוד או ביצוע מדידות בהתאם להנחיות','תיאום ביקורים ובדיקות','עזרה בפעולות יומיומיות בבית','תמיכה רגשית במטופל/ת','לא הייתי מעורב/ת בפעולות כאלה','אחר']},
      {q:'כיצד נודע לך מה מצופה ממך במהלך האשפוז?',multi:true,a:['קיבלתי הסבר ישירות מהצוות','המטופל/ת הסביר/ה לי','קיבלתי הנחיות כתובות','למדתי תוך כדי התהליך','לא היה ברור לי מה מצופה ממני','לא נדרשתי לבצע פעולות מיוחדות','אחר']},
      {q:'בפעם האחרונה שהתעוררה שאלה או דאגה בנוגע לטיפול, מה עשית קודם?',a:['פניתי לצוות הרפואי','התייעצתי עם המטופל/ת','התייעצתי עם בן משפחה אחר','חיפשתי מידע בהנחיות שקיבלנו','חיפשתי מידע באינטרנט','המתנתי לביקור או לשיחה הבאה','לא התעורר מצב כזה','אחר']},
      {q:'באילו מצבים, אם בכלל, נתקלת בקושי במהלך הליווי?',multi:true,a:['להבין את ההנחיות הרפואיות','לדעת אילו פעולות באחריותי','לקבל מידע על המשך הטיפול','ליצור קשר עם הצוות','לשלב את הסיוע בטיפול עם שגרת החיים שלי','להשתמש בציוד או במכשירים','להתמודד עם דאגה או חוסר ודאות','לא נתקלתי בקושי','אחר']},
      {q:'כיצד השפיעה המעורבות בטיפול על שגרת היום שלך?',a:['נדרשתי לשנות באופן משמעותי את סדר היום שלי','נדרשתי לבצע התאמות מסוימות','כמעט שלא נדרשתי לשנות את השגרה','לא נדרשתי לשנות את השגרה','אחר']},
      {q:'מה מהבאים סייע לך במסגרת הליווי?',multi:true,a:['הסברים ישירים מהצוות הרפואי','הנחיות כתובות וברורות','אפשרות ליצור קשר עם הצוות','עזרה מבני משפחה או אנשים נוספים','ציוד ואמצעים זמינים בבית','היכרות מוקדמת עם צורכי המטופל/ת','לא היה גורם מסוים שסייע לי','אחר']},
      {q:'האם יש משהו נוסף שחשוב לך לספר על חוויית הליווי באשפוז הביתי?',open:true}
    ]
  }
};

/**
 * Run ONCE to create both Forms (re-running safely reuses existing Form IDs).
 * Form response tabs are automatically added by Google to the target Sheet.
 * Existing four research tabs are kept unchanged.
 */
function createShortResearchForms() {
  const folder = DriveApp.getFolderById(HIT_SHORT_FORMS.folderId);
  const targetSheet = SpreadsheetApp.openById(HIT_SHORT_FORMS.spreadsheetId);
  if (!targetSheet) throw new Error('Research spreadsheet not found');
  const props = PropertiesService.getScriptProperties();
  ['patient', 'family'].forEach(type => {
    const config = HIT_SHORT_FORMS[type];
    const propertyName = HIT_SHORT_FORMS.propertyPrefix + type;
    const existingId = props.getProperty(propertyName);
    let form;
    if (existingId) {
      form = FormApp.openById(existingId);
      console.log(type + ': existing form reused, not duplicated');
    } else {
      form = FormApp.create(config.title);
      form.setDescription(config.description);
      form.setCollectEmail(false);
      form.setConfirmationMessage('תודה על ההשתתפות במחקר. התשובות התקבלו.');
      form.setAllowResponseEdits(false);
      form.setShowLinkToRespondAgain(false);

      // This administrative consent item is not one of the eight research questions.
      form.addCheckboxItem()
        .setTitle('הסכמה להשתתפות: קראתי את הסבר המחקר, אני משתתף/ת מרצוני ומבין/ה שאפשר להפסיק או לדלג על שאלות.')
        .setChoiceValues(['אני מסכים/ה להשתתף'])
        .setRequired(true);

      config.questions.forEach(q => {
        let item;
        if (q.open) {
          item = form.addParagraphTextItem();
        } else if (q.multi) {
          item = form.addCheckboxItem().setChoiceValues(q.a);
        } else {
          item = form.addMultipleChoiceItem().setChoiceValues(q.a);
        }
        item.setTitle(q.q).setRequired(false);
      });

      DriveApp.getFileById(form.getId()).moveTo(folder);
      form.setDestination(FormApp.DestinationType.SPREADSHEET, HIT_SHORT_FORMS.spreadsheetId);
      props.setProperty(propertyName, form.getId());

      // One trigger per Form, one notification per submission. No answer content.
      ScriptApp.newTrigger('notifyShortResearchForm')
        .forForm(form).onFormSubmit().create();
    }
    console.log('TYPE=' + type);
    console.log('FORM_ID=' + form.getId());
    console.log('RESPONDENT_URL=' + form.getPublishedUrl());
    console.log('EDITOR_URL=' + form.getEditUrl());
  });
  console.log('SUCCESS: two short questionnaires ready for test; do not distribute before privacy review.');
}

/** Notification contains no personal data or answer content. */
function notifyShortResearchForm(event) {
  if (!event || !event.source) throw new Error('Missing Form submit event');
  const form = event.source;
  const props = PropertiesService.getScriptProperties();
  const ids = [props.getProperty('HIT_SHORT_FORM_patient'), props.getProperty('HIT_SHORT_FORM_family')];
  if (ids.indexOf(form.getId()) === -1) throw new Error('Unknown form');
  MailApp.sendEmail({
    to: HIT_SHORT_FORMS.notifyEmail,
    subject: 'HIT — התקבלה תשובה חדשה לשאלון חוויית אשפוז ביתי',
    body: 'נרשמה תשובה חדשה בטופס המחקר:\n' + form.getTitle() +
      '\n\nהתשובות עצמן נשמרות בגיליון המחקר, ולא נשלחות בדוא"ל.' +
      '\nגיליון: https://docs.google.com/spreadsheets/d/' +
      HIT_SHORT_FORMS.spreadsheetId + '/edit'
  });
}

/** Prints both respondent URLs again, without creating any forms. */
function showShortResearchFormLinks() {
  const props = PropertiesService.getScriptProperties();
  ['patient','family'].forEach(type => {
    const id = props.getProperty(HIT_SHORT_FORMS.propertyPrefix + type);
    if (!id) throw new Error('First run createShortResearchForms');
    console.log(type + ': ' + FormApp.openById(id).getPublishedUrl());
  });
}
