class TaxConfigService {
  constructor(taxConfigRepository) {
    this.taxConfigRepo = taxConfigRepository;
  }
  
  getAllConfig() {
    return this.taxConfigRepo.findAll();
  }
}

const taxConfigService = new TaxConfigService(taxConfigRepo);
