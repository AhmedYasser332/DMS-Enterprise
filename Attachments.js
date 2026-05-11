// ==========================================
// التعامل مع المرفقات و Google Drive
// ==========================================

// 1. جلب المرفقات
function getAttachments(recordId) {
  try {
    const allAttachments = getSheetData(CONFIG.SHEETS.ATTACHMENTS);
    return allAttachments.filter(att => att.Record_ID === recordId);
  } catch (error) {
    throw new Error("فشل جلب المرفقات: " + error.message);
  }
}

// 2. رفع مرفق جديد
function uploadAttachment(recordId, fileName, base64Data, mimeType) {
  try {
    const folderName = "DMS_Archive_System";
    let folderIter = DriveApp.getFoldersByName(folderName);
    let folder = folderIter.hasNext() ? folderIter.next() : DriveApp.createFolder(folderName);
    
    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);
    const file = folder.createFile(blob);
    
    const driveFileId = file.getId();
    const driveUrl = file.getUrl();
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.ATTACHMENTS);
    const fileId = "FILE_" + new Date().getTime();
    const uploadedBy = Session.getActiveUser().getEmail() || 'Admin';
    const uploadedAt = new Date().toLocaleString('en-GB');
    
    // بناء صف جديد أوتوماتيكياً بناءً على ترتيب الأعمدة
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let newRow = new Array(headers.length).fill("");
    
    newRow[headers.indexOf("File_ID")] = fileId;
    newRow[headers.indexOf("Record_ID")] = recordId;
    newRow[headers.indexOf("File_Name")] = fileName;
    newRow[headers.indexOf("Drive_File_ID")] = driveFileId;
    newRow[headers.indexOf("Drive_URL")] = driveUrl;
    newRow[headers.indexOf("Uploaded_By")] = uploadedBy;
    newRow[headers.indexOf("Uploaded_At")] = uploadedAt;
    newRow[headers.indexOf("Is_Deleted")] = false;
    
    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    logAction("رفع مرفق", `تم رفع الملف: ${fileName}`);
    return { status: "success", message: "تم رفع الملف بنجاح!" };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

// 3. حذف مرفق (نقل للسلة)
function deleteAttachment(fileId, fileName) {
  try {
    const success = updateCellById(CONFIG.SHEETS.ATTACHMENTS, fileId, "File_ID", "Is_Deleted", true);
    if (success) {
      logAction("حذف مرفق", `تم نقل الملف "${fileName}" لسلة المهملات`);
      return { status: "success" };
    }
    return { status: "error", message: "الملف غير موجود!" };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function authorizeDrive() {
  DriveApp.getRootFolder();
}