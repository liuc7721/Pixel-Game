const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_QUESTIONS = "題目";
const SHEET_ANSWERS = "回答";

function doGet(e) {
  try {
    const count = parseInt(e.parameter.count) || 5; 
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_QUESTIONS);
    const data = sheet.getDataRange().getValues();
    
    // Headers: 題號(0), 題目(1), A(2), B(3), C(4), D(5), 解答(6)
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({ error: "無題目資料" })).setMimeType(ContentService.MimeType.JSON);
    
    const rows = data.slice(1);
    const shuffled = rows.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    const questions = selected.map(row => ({
      id: row[0],
      question: row[1],
      options: [
        { label: 'A', text: String(row[2]) },
        { label: 'B', text: String(row[3]) },
        { label: 'C', text: String(row[4]) },
        { label: 'D', text: String(row[5]) }
      ]
    }));
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, questions })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const user_id = payload.id;
    const user_answers = payload.answers; // e.g. { "1": "A", "2": "C" }
    
    const qSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_QUESTIONS);
    const qData = qSheet.getDataRange().getValues();
    const correctMap = {};
    for(let i = 1; i < qData.length; i++) {
        correctMap[String(qData[i][0])] = String(qData[i][6]).trim().toUpperCase();
    }
    
    let score = 0;
    for(let qId in user_answers) {
       if(String(user_answers[qId]).trim().toUpperCase() === correctMap[String(qId)]) {
         score += 1;
       }
    }
    
    const aSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_ANSWERS);
    if (!aSheet) {
      throw new Error("找不到『回答』工作表");
    }
    
    const aData = aSheet.getDataRange().getValues();
    let userRowIndex = -1;
    for(let i = 1; i < aData.length; i++) {
      if(String(aData[i][0]) === String(user_id)) {
        userRowIndex = i + 1; // 1-based index
        break;
      }
    }
    
    const threshold = parseInt(payload.pass_threshold) || Object.keys(user_answers).length; 
    let isPassed = (score >= threshold);
    const nowISO = new Date().toISOString();
    
    if(userRowIndex === -1) {
      const attempts = 1;
      const totalScore = score;
      const maxScore = score;
      const firstClearScore = isPassed ? score : "";
      const attemptsToClear = isPassed ? 1 : "";
      
      aSheet.appendRow([user_id, attempts, totalScore, maxScore, firstClearScore, attemptsToClear, nowISO]);
    } else {
      let oldAttempts = parseInt(aData[userRowIndex-1][1]) || 0;
      let oldTotalScore = parseFloat(aData[userRowIndex-1][2]) || 0;
      let oldMaxScore = parseFloat(aData[userRowIndex-1][3]) || 0;
      let oldFirstClearScore = aData[userRowIndex-1][4];
      let oldAttemptsToClear = aData[userRowIndex-1][5];
      
      const newAttempts = oldAttempts + 1;
      const newTotalScore = oldTotalScore + score;
      const newMaxScore = Math.max(oldMaxScore, score);
      
      let newFirstClearScore = oldFirstClearScore;
      let newAttemptsToClear = oldAttemptsToClear;
      
      // Update first clear info ONLY if passed and wasn't passed before
      if(isPassed && !oldFirstClearScore && oldFirstClearScore !== 0) {
         newFirstClearScore = score;
         newAttemptsToClear = newAttempts;
      }
      
      aSheet.getRange(userRowIndex, 2).setValue(newAttempts);
      aSheet.getRange(userRowIndex, 3).setValue(newTotalScore);
      aSheet.getRange(userRowIndex, 4).setValue(newMaxScore);
      aSheet.getRange(userRowIndex, 5).setValue(newFirstClearScore);
      aSheet.getRange(userRowIndex, 6).setValue(newAttemptsToClear);
      aSheet.getRange(userRowIndex, 7).setValue(nowISO);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      score, 
      isPassed,
      totalQuestions: Object.keys(user_answers).length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
