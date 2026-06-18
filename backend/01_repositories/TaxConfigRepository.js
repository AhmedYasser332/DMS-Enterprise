class TaxConfigRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.TAX_CONFIG, "Task_Type");
  }
}

const taxConfigRepo = new TaxConfigRepository();
