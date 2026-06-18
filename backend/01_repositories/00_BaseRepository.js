/**
 * Base Repository (Data Access Layer)
 * تطبيق نمط Repository للتعامل مع قاعدة البيانات بشكل مجرد.
 * هذا الكلاس هو الأب (Parent) لكل الجداول، ويمنع تكرار الكود نهائياً.
 */
class BaseRepository {
  /**
   * @param {string} tableName - اسم الجدول (من Config.TABLES)
   * @param {string} idColumn - اسم عمود المعرف الأساسي (مثل Client_ID, Record_ID)
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
    let mappedEntity = {};
    headers.forEach((header, index) => {
      if (header) {
        mappedEntity[String(header).trim()] = row[index];
      }
    });
    return mappedEntity;
  }

  /**
   * 1. جلب كل البيانات (Read)
   * @param {boolean} excludeDeleted - هل نتجاهل المحذوف؟ (الافتراضي نعم)
   */
  findAll(excludeDeleted = true) {
    const sheet = this._getSheet();
    const sheetRows = sheet.getDataRange().getDisplayValues(); // DisplayValues لجلب التواريخ كنصوص
    
    if (sheetRows.length <= 1) return [];

    const headers = sheetRows[0].map(h => String(h).trim());
    const rows = sheetRows.slice(1);
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
    const rawHeaders = sheet.getDataRange().getValues()[0];
    let headers = rawHeaders.map(h => String(h).trim());
    
    // Auto-migration: Check for missing columns and add them
    let missingHeaders = [];
    for (let key in entityObject) {
      if (headers.indexOf(key) === -1) {
        missingHeaders.push(key);
      }
    }
    
    if (missingHeaders.length > 0) {
      const newHeaders = rawHeaders.concat(missingHeaders);
      sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
      headers = headers.concat(missingHeaders);
    }

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
    CacheManager.bustCache(); // Invalidate cache globally
    return entityObject;
  }

  /**
   * 4. تحديث حقل أو أكثر (Update)
   * @param {string} id - المعرف
   * @param {Object} updatedFields - الحقول المراد تحديثها { "Name": "أحمد", "Status": true }
   */
  update(id, updatedFields) {
    const sheet = this._getSheet();
    const sheetRows = sheet.getDataRange().getValues();
    const headers = sheetRows[0].map(h => String(h).trim());
    const idColIdx = headers.indexOf(this.idColumn);

    if (idColIdx === -1) throw new Error(`Column ${this.idColumn} not found in ${this.tableName}`);

    for (let i = 1; i < sheetRows.length; i++) {
      if (sheetRows[i][idColIdx] == id) {
        // تحسين الأداء: تجميع التحديثات في مصفوفة وتحديث الصف بالكامل مرة واحدة (Batch Operation)
        let rowToUpdate = [...sheetRows[i]];
        let hasChanges = false;
        
        for (let key in updatedFields) {
          const targetColIdx = headers.indexOf(key);
          if (targetColIdx !== -1) {
            rowToUpdate[targetColIdx] = updatedFields[key];
            hasChanges = true;
          }
        }
        
        if (hasChanges) {
          sheet.getRange(i + 1, 1, 1, headers.length).setValues([rowToUpdate]);
          this.db.commit();
          CacheManager.bustCache(); // Invalidate cache globally
        }
        
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
    const sheetRows = sheet.getDataRange().getValues();
    const headers = sheetRows[0].map(h => String(h).trim());
    const idColIdx = headers.indexOf(this.idColumn);
    
    for (let i = 1; i < sheetRows.length; i++) {
      if (sheetRows[i][idColIdx] == id) {
        sheet.deleteRow(i + 1); // +1 لأن الـ getRange بيبدأ من 1 واللوب من 0
        this.db.commit();
        CacheManager.bustCache(); // Invalidate cache globally
        return true;
      }
    }
    return false;
  }
}
