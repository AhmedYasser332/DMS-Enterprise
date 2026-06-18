class CredentialService {
  constructor(credentialRepository, logRepository) {
    this.credentialRepo = credentialRepository;
    this.logRepo = logRepository;
  }

  // Only return metadata (no password)
  getAllCredentialsMeta(userEmail) {
    const creds = this.credentialRepo.findAll();
    return creds.map(c => {
      return {
        Cred_ID: c.Cred_ID,
        Client_ID: c.Client_ID,
        Portal_Type: c.Portal_Type,
        Username: c.Username,
        Expiry_Date: c.Expiry_Date,
        Last_Rotated: c.Last_Rotated,
        Updated_By: c.Updated_By,
        Is_Deleted: c.Is_Deleted
      };
    });
  }

  revealCredential(credId, userEmail) {
    const cred = this.credentialRepo.findById(credId);
    if (!cred || String(cred.Is_Deleted).toUpperCase() === "TRUE") {
      throw new Error("بيانات الدخول غير موجودة.");
    }
    
    // Log access
    this.logRepo.logAction(
      "وصول لبيانات الدخول", 
      `تم كشف بيانات الدخول لبوابة ${cred.Portal_Type} الخاصة بالعميل (ID: ${cred.Client_ID})`, 
      userEmail
    );
    
    return {
      Username: cred.Username,
      Password: cred.Password // Plaintext for MVP
    };
  }
}

const credentialService = new CredentialService(credentialRepo, logRepo);
