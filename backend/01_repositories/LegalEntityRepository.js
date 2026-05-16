class LegalEntityRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.LEGAL_ENTITIES, "Entity_ID");
  }
}

const legalEntityRepo = new LegalEntityRepository();
