/**
 * Base Repository (Data Access Layer)
 * تطبيق نمط Repository للتعامل مع قاعدة البيانات بشكل مجرد.
 * هذا الكلاس هو الأب (Parent) لكل الجداول، ويمنع تكرار الكود نهائياً.
 */
class BaseRepository {
  /**
   * @param {string} tableName - اسم الجدول (من Config.TABLES)
   * @param {string} idColumn - اسم عمود المعرف الأساسي (مثل Main_ID, Record_ID)
   */
  constructor(tableName, idColumn) {
    this.tableName = tableName;
    this.idColumn = idColumn;
    
    // حقن الاعتمادية (Dependency Injection - Service Locator) 
    // نعتمد على الـ Singleton Database اللي أنشأناه
    this.db = Database; 
  }

  // دالة مساعدة خاصة (Private) لجلب الشيت
  _getSheet() {
    return this.db.getSheet(this.tableName);
  }

  // دالة مساعدة لتحويل صفوف جوجل شيت العبيطة إلى كائنات (Objects) محترمة
  _mapRowToObject(row, headers) {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  }

  /**
   * 1. جلب كل البيانات (Read)
   * @param {boolean} excludeDeleted - هل نتجاهل المحذوف؟ (الافتراضي نعم)
   */
  findAll(excludeDeleted = true) {
    const sheet = this._getSheet();
    const data = sheet.getDataRange().getDisplayValues(); // DisplayValues لجلب التواريخ كنصوص
    
    if (data.length <= 1) return [];

    const headers = data[0];
    const rows = data.slice(1);
    const isDeletedIdx = headers.indexOf("Is_Deleted");

    return rows
      .map(row => this._mapRowToObject(row, headers))
      .filter(item => {
        if (!excludeDeleted || isDeletedIdx === -1) return true;
        return String(item["Is_Deleted"]).toUpperCase() !== "TRUE";
      });
  }

  /**
   * 2. جلب عنصر واحد عن طريق الـ ID (Read One)
   */
  findById(id) {
    // نجيب حتى المحذوف عشان لو بنعمل Validation أو استعادة
    const allRecords = this.findAll(false); 
    return allRecords.find(item => item[this.idColumn] == id) || null;
  }

  /**
   * 3. إضافة صف جديد (Create)
   * @param {Object} entityObject - كائن يحتوي على البيانات
   */
  create(entityObject) {
    const sheet = this._getSheet();
    const headers = sheet.getDataRange().getValues()[0];
    let newRow = new Array(headers.length).fill("");

    // تعبئة الصف بناءً على الـ Headers أوتوماتيكياً (Dynamic Mapping)
    for (let key in entityObject) {
      const idx = headers.indexOf(key);
      if (idx !== -1) {
        newRow[idx] = entityObject[key];
      }
    }

    sheet.appendRow(newRow);
    this.db.commit(); // حفظ فوري
    return entityObject;
  }

  /**
   * 4. تحديث حقل أو أكثر (Update)
   * @param {string} id - المعرف
   * @param {Object} updatedFields - الحقول المراد تحديثها { "Name": "أحمد", "Status": true }
   */
  update(id, updatedFields) {
    const sheet = this._getSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColIdx = headers.indexOf(this.idColumn);

    if (idColIdx === -1) throw new Error(`Column ${this.idColumn} not found in ${this.tableName}`);

    for (let i = 1; i < data.length; i++) {
      if (data[i][idColIdx] == id) {
        // تحديث الحقول المطلوبة فقط بذكاء بدون لمس باقي الصف
        for (let key in updatedFields) {
          const targetColIdx = headers.indexOf(key);
          if (targetColIdx !== -1) {
            sheet.getRange(i + 1, targetColIdx + 1).setValue(updatedFields[key]);
          }
        }
        this.db.commit();
        return true;
      }
    }
    return false;
  }

  /**
   * 5. الحذف المؤقت (Soft Delete)
   */
  softDelete(id) {
    return this.update(id, { "Is_Deleted": true });
  }

  /**
   * 6. الاستعادة من سلة المهملات (Restore)
   */
  restore(id) {
    return this.update(id, { "Is_Deleted": false });
  }

  /**
   * 7. الحذف النهائي من قاعدة البيانات (Hard Delete)
   */
  hardDelete(id) {
    const sheet = this._getSheet();
    const data = sheet.getDataRange().getValues();
    const idColIdx = data[0].indexOf(this.idColumn);
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColIdx] == id) {
        sheet.deleteRow(i + 1); // +1 لأن الـ getRange بيبدأ من 1 واللوب من 0
        this.db.commit();
        return true;
      }
    }
    return false;
  }
}