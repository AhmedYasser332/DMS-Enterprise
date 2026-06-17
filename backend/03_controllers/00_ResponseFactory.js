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

  /**
   * Higher Order Function to eliminate try/catch boilerplate across controllers
   * @param {Function} actionFn - Service function to execute
   * @param {string|Function} successMessage - Static string or dynamic message function (takes data as arg)
   */
  static execute(actionFn, successMessage = "تمت العملية بنجاح") {
    try {
      const data = actionFn();
      const message = typeof successMessage === 'function' ? successMessage(data) : successMessage;
      return ResponseFactory.success(data, message);
    } catch (error) {
      return ResponseFactory.error(error.message);
    }
  }
}
