class LogService {
  constructor(logRepository) {
    this.logRepo = logRepository;
  }

  getAllLogs() {
    // نجلب السجلات (يفضل ترتيبها من الأحدث للأقدم)
    const logs = this.logRepo.findAll(false);
    return logs.reverse(); // آخر سجل يظهر أولاً
  }
}

const logService = new LogService(logRepo);
