/**
 * Main Entry Point
 * نقطة البداية لتشغيل التطبيق على المتصفح
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('نظام الأرشيف الإلكتروني (Enterprise)')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * دالة دمج الملفات (تسمح لنا بتقسيم الواجهة لملفات صغيرة وتنظيمها)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}