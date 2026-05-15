/**
 * Response Factory (Factory Pattern)
 * مصنع الردود الموحدة لضمان ثبات شكل استجابة الـ API في كل النظام
 */
class ResponseFactory {
  static success(data = null, message = "تمت العملية بنجاح") {
    return JSON.stringify({
      status: Config.STATUS.SUCCESS,
      data: data,
      message: message
    });
  }

  static error(message = "حدث خطأ غير متوقع", details = null) {
    return JSON.stringify({
      status: Config.STATUS.ERROR,
      message: message,
      details: details
    });
  }
}
