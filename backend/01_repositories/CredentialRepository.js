class CredentialRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.CREDENTIALS, "Cred_ID");
  }
}

const credentialRepo = new CredentialRepository();
