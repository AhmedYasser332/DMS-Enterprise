/**
 * AttachmentService (Business Logic Layer)
 * مسؤولة عن معالجة الملفات ورفعها إلى Google Drive وربطها بقاعدة البيانات
 */
class AttachmentService {
  constructor(attachmentRepository, logRepository, userRepository) {
    this.attachmentRepo = attachmentRepository;
    this.logRepo = logRepository;
    this.userRepo = userRepository;
    this.DRIVE_FOLDER_NAME = "DMS_Archive_System";
  }

  _checkPermission(userEmail, action) {
    if(!userEmail || userEmail === 'System') return; 
    const user = this.userRepo.findByUsername(userEmail);
    if(!user) throw new Error("مستخدم غير صالح لعملية " + action);
    if(user.Role === 'Admin') return; 
    if(user.Role === 'Viewer') throw new Error("صلاحيات القراءة فقط. لا يمكنك " + action);
  }

  // دالة مساعدة خاصة للتأكد من وجود الفولدر في جوجل درايف
  _getOrCreateFolder() {
    let folderIter = DriveApp.getFoldersByName(this.DRIVE_FOLDER_NAME);
    if (folderIter.hasNext()) {
      return folderIter.next();
    }
    return DriveApp.createFolder(this.DRIVE_FOLDER_NAME);
  }

  getAllAttachments() {
    return this.attachmentRepo.findAll();
  }

  uploadAttachment(recordId, fileName, base64Data, mimeType, userEmail) {
    this._checkPermission(userEmail, 'رفع مرفق');
    try {
      const folder = this._getOrCreateFolder();
      const decodedData = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decodedData, mimeType, fileName);
      
      // الرفع لجوجل درايف
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const driveFileId = file.getId();
      const driveUrl = file.getUrl();

      // الحفظ في قاعدة البيانات
      const newAttachment = {
        "Attachment_ID": "FILE_" + new Date().getTime(),
        "Record_ID": recordId,
        "File_Name": fileName,
        "Mime_Type": mimeType,
        "Size": blob.getBytes().length,
        "Drive_File_ID": driveFileId,
        "View_Link": driveUrl,
        "Uploaded_By": userEmail || "Admin",
        "Uploaded_At": new Date().toLocaleString('en-GB'),
        "Is_Deleted": false
      };

      this.attachmentRepo.create(newAttachment);
      this.logRepo.logAction("رفع مرفق", `تم رفع الملف: ${fileName}`, userEmail);

      return newAttachment;
    } catch (error) {
      throw new Error("فشل أثناء رفع الملف إلى Google Drive: " + error.message);
    }
  }

  deleteAttachment(fileId, fileName, userEmail) {
    this._checkPermission(userEmail, 'حذف مرفق');
    const success = this.attachmentRepo.softDelete(fileId);
    if (!success) throw new Error("الملف غير موجود في قاعدة البيانات.");
    
    this.logRepo.logAction("حذف مرفق", `تم نقل الملف "${fileName}" لسلة المهملات`, userEmail);
    return true;
  }

  getFileBase64(driveFileId) {
    try {
      const file = DriveApp.getFileById(driveFileId);
      const blob = file.getBlob();
      return {
        base64: Utilities.base64Encode(blob.getBytes()),
        mimeType: blob.getContentType()
      };
    } catch (error) {
      throw new Error("لا يمكن جلب بيانات الملف من جوجل درايف للطباعة.");
    }
  }
}

const attachmentService = new AttachmentService(attachmentRepo, logRepo, userRepo);
