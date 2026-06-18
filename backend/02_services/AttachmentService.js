/**
 * AttachmentService (Business Logic Layer)
 * مسؤولة عن معالجة الملفات ورفعها إلى Google Drive وربطها بقاعدة البيانات
 */
class AttachmentService {
  constructor(attachmentRepository, logRepository, userRepository, recordRepository, groupRepository, clientRepository) {
    this.attachmentRepo = attachmentRepository;
    this.logRepo = logRepository;
    this.userRepo = userRepository;
    this.recordRepo = recordRepository;
    this.groupRepo = groupRepository;
    this.clientRepo = clientRepository;
    this.DRIVE_FOLDER_NAME = "DMS_Archive_System";
  }

  _checkPermission(userEmail, action) {
    if(!userEmail || userEmail === 'System') return; 
    const user = this.userRepo.findByUsername(userEmail);
    if(!user) throw new Error("مستخدم غير صالح لعملية " + action);
    if(user.Role === 'Admin') return; 
    if(user.Role === 'Viewer') throw new Error("صلاحيات القراءة فقط. لا يمكنك " + action);
  }

  // دالة مساعدة خاصة للتأكد من وجود الفولدر الرئيسي
  _getOrCreateFolder() {
    return this._getOrCreateSubFolder(DriveApp, this.DRIVE_FOLDER_NAME);
  }

  // دالة مساعدة لإنشاء أو جلب المجلدات الفرعية ديناميكياً
  _getOrCreateSubFolder(parentFolder, folderName) {
    // تنظيف اسم الفولدر من الحروف الممنوعة في أسماء الملفات/المجلدات
    const safeName = String(folderName).replace(/[\\/:*?"<>|]/g, '-').trim() || "Unknown";
    let folderIter = parentFolder.getFoldersByName(safeName);
    if (folderIter.hasNext()) {
      return folderIter.next();
    }
    return parentFolder.createFolder(safeName);
  }

  getAllAttachments() {
    return this.attachmentRepo.findAll();
  }

  uploadAttachment(recordId, fileName, base64Data, mimeType, userEmail) {
    this._checkPermission(userEmail, 'رفع مرفق');
    try {
      // جلب بيانات السجل والمجموعة والعميل لتكوين الهيكل الهرمي
      const record = this.recordRepo.findById(recordId);
      if (!record) throw new Error("السجل غير موجود. لا يمكن إنشاء مسار الحفظ.");
      
      const group = this.groupRepo.findById(record.Group_ID);
      if (!group) throw new Error("المجموعة غير موجودة.");

      const client = this.clientRepo.findById(group.Client_ID);
      if (!client) throw new Error("العميل غير موجود.");

      // بناء هيكل المجلدات: Root -> Client -> Group -> Record
      const rootFolder = this._getOrCreateFolder();
      
      const clientFolderName = `${client.Name} - ${client.Client_ID}`;
      const clientFolder = this._getOrCreateSubFolder(rootFolder, clientFolderName);
      
      const groupFolderName = `${group.Name} - ${group.Group_ID}`;
      const groupFolder = this._getOrCreateSubFolder(clientFolder, groupFolderName);
      
      const recordTitle = record.Title || 'بدون عنوان';
      const recordFolderName = `${recordTitle} - ${record.Record_ID}`;
      const recordFolder = this._getOrCreateSubFolder(groupFolder, recordFolderName);

      const decodedData = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decodedData, mimeType, fileName);
      
      // الرفع لجوجل درايف بداخل مجلد السجل
      const file = recordFolder.createFile(blob);
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

const attachmentService = new AttachmentService(attachmentRepo, logRepo, userRepo, recordRepo, groupRepo, clientRepo);
