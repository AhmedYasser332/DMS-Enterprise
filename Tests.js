function runDatabaseTests() {
  Logger.log("=== بدء اختبارات قاعدة البيانات ===");
  
  // 1. اختبار إضافة قسم رئيسي
  Logger.log("1. جاري اختبار الإضافة...");
  let addResult = addMainDepartment("قسم الاختبار الأوتوماتيكي");
  if (addResult.status === "success") {
    Logger.log("✅ الإضافة تمت بنجاح.");
  } else {
    Logger.log("❌ فشل الإضافة: " + addResult.message);
  }
  
  // إجبار الشيت على تحديث البيانات فوراً
  SpreadsheetApp.flush();
  
  // 2. اختبار جلب البيانات
  Logger.log("2. جاري اختبار جلب الأقسام...");
  let depts = getMainDepartments();
  let testDept = depts.find(d => d.Name === "قسم الاختبار الأوتوماتيكي");
  
  if (testDept) {
    Logger.log("✅ تم العثور على القسم في الشيت بنجاح. (ID: " + testDept.Main_ID + ")");
    
    // 3. اختبار الحذف (نقل لسلة المهملات)
    Logger.log("3. جاري اختبار الحذف (سلة المهملات)...");
    let deleteResult = deleteMainDepartment(testDept.Main_ID, testDept.Name);
    
    if (deleteResult.status === "success") {
      Logger.log("✅ تم حذف القسم بنجاح.");
    } else {
      Logger.log("❌ فشل الحذف: " + deleteResult.message);
    }
    
  } else {
    Logger.log("❌ القسم لم يظهر في دالة الجلب! يوجد مشكلة في دالة getMainDepartments");
  }
  
  Logger.log("=== انتهاء الاختبارات ===");
}