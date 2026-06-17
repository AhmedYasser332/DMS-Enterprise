/**
 * Entry Point for Google Apps Script Web App
 */
function doGet(e) {
  // ⚡ التعديل هنا: ضفنا مسار الفولدر لاسم الملف ⚡
  return HtmlService.createTemplateFromFile('frontend/Index')
    .evaluate()
    .setTitle('نظام الأرشيف الإلكتروني (Enterprise)')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (err) {
    console.error("فشل في العثور على الملف: " + filename);
    throw new Error("لم يتم العثور على ملف HTML باسم: " + filename);
  }
}
