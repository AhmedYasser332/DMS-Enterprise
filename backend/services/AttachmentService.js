/**
 * AttachmentService (Business Logic Layer)
 * مسؤولة عن معالجة الملفات ورفعها إلى Google Drive وربطها بقاعدة البيانات
 */
class AttachmentService {
  constructor(attachmentRepository, logRepository) {
    this.attachmentRepo = attachmentRepository;
    this.logRepo = logRepository;
    this.DRIVE_FOLDER_NAME = "DMS_Archive_System";
  }

  // دالة مساعدة خاصة للتأكد من وجود الفولدر في جوجل درايف
  _getOrCreateFolder() {
    let folderIter = DriveApp.getFoldersByName(this.DRIVE_FOLDER_NAME);
    if (folderIter.hasNext()) {
      return folderIter.next();
    }
    return DriveApp.createFolder(this.DRIVE_FOLDER_NAME);
  }

  uploadAttachment(recordId, fileName, base64Data, mimeType, userEmail) {
    try {
      const folder = this._getOrCreateFolder();
      const decodedData = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decodedData, mimeType, fileName);
      
      // الرفع لجوجل درايف
      const file = folder.createFile(blob);
      const driveFileId = file.getId();
      const driveUrl = file.getUrl();

      // الحفظ في قاعدة البيانات
      const newAttachment = {
        "File_ID": "FILE_" + new Date().getTime(),
        "Record_ID": recordId,
        "File_Name": fileName,
        "Drive_File_ID": driveFileId,
        "Drive_URL": driveUrl,
        "Uploaded_By": userEmail || "Admin",
        "Uploaded_At": new Date().toLocaleString('en-GB'),
        "Is_Deleted": false
      };

      this.attachmentRepo.create(newAttachment);
      this.logRepo.logAction("رفع مرفق", `تم رفع الملف: ${fileName}`, userEmail);

      return { status: Config.STATUS.SUCCESS, message: "تم رفع الملف بنجاح!" };
    } catch (error) {
      throw new Error("فشل أثناء رفع الملف إلى Google Drive: " + error.message);
    }
  }

  deleteAttachment(fileId, fileName, userEmail) {
    const success = this.attachmentRepo.softDelete(fileId);
    if (!success) throw new Error("الملف غير موجود في قاعدة البيانات.");
    
    this.logRepo.logAction("حذف مرفق", `تم نقل الملف "${fileName}" لسلة المهملات`, userEmail);
    return true;
  }
}

const attachmentService = new AttachmentService(attachmentRepo, logRepo);