/**
 * CacheManager
 * المسؤول عن تسريع التطبيق باستخدام CacheService لتقليل أوقات التحميل
 * ويستخدم تقنية Data Versioning لضمان عدم عرض بيانات قديمة أبداً (Cache Busting)
 */
class CacheManager {
  /**
   * جلب رقم الإصدار الحالي للبيانات. 
   * يتغير هذا الرقم مع أي عملية تعديل، إضافة، أو حذف في قاعدة البيانات.
   * @returns {string}
   */
  static getDataVersion() {
    const props = PropertiesService.getScriptProperties();
    let version = props.getProperty('DATA_VERSION');
    if (!version) {
      version = Date.now().toString();
      props.setProperty('DATA_VERSION', version);
    }
    return version;
  }

  /**
   * مسح الكاش فعلياً من خلال تغيير رقم الإصدار لنسخة جديدة
   * يُستدعى تلقائياً من BaseRepository عند أي تعديل
   */
  static bustCache() {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('DATA_VERSION', Date.now().toString());
  }

  /**
   * جلب داتا من الكاش بناءً على المفتاح، ولو مش موجودة ينفذ الدالة (Fallback)
   * @param {string} baseKey - المفتاح الأساسي (مثل INITIAL_DATA_email)
   * @param {Function} fetchCallback - الدالة اللي هتتنفذ لو الكاش فاضي أو قديم
   * @param {number} expirationInSeconds - مدة الصلاحية بالثواني (الافتراضي 300 ثانية = 5 دقائق)
   */
  static getOrFetch(baseKey, fetchCallback, expirationInSeconds = 300) {
    const cache = CacheService.getScriptCache();
    const currentVersion = this.getDataVersion();
    // مفتاح الكاش بيحتوي على رقم الإصدار، فلو الإصدار اتغير، المفتاح هيبقى جديد ومش هيقرأ القديم
    const versionedKey = `${baseKey}_V${currentVersion}`;
    
    const cachedData = cache.get(versionedKey);
    
    if (cachedData) {
      // لو الداتا موجودة في الكاش، رجعها فوراً (Zero-Latency)
      return JSON.parse(cachedData);
    }

    // لو مفيش كاش أو قديم، هننفذ عملية القراءة التقيلة من الـ Sheets
    const freshData = fetchCallback();
    
    // تقسيم وحفظ الكاش
    const stringifiedData = JSON.stringify(freshData);
    
    // جوجل كاش بيشيل حد أقصى 100KB للقيمة الواحدة.
    // لتفادي الخطأ، نقوم بتخزينه بشكل آمن:
    try {
      if (stringifiedData.length < 100000) {
        cache.put(versionedKey, stringifiedData, expirationInSeconds);
      } else {
        // ممكن نطبق تقنية الـ Chunking لو الداتا زادت جدا، بس كبداية نتجاهل حفظها في الكاش لو ضخمة جدا
        console.warn("Payload exceeds 100KB limit. Not caching.");
      }
    } catch (e) {
      console.warn("Failed to cache data: " + e.message);
    }
    
    return freshData;
  }
}
