export const environment = {
  production: false,
  apiUrl: 'http://localhost:8088',
  whatsappApiUrl: 'https://whatsapp-api.afriland.com',
  selectSystemUrl: 'https://select-system.afriland.com',
  notificationConfig: {
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: true,
    delais: {
      initial: 0,
      relance: 21,
      miseEnDemeure: 30,
      suspension: 38
    }
  },
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
  },
  features: {
    realTimeNotifications: true,
    bulkOperations: true,
    advancedReporting: true,
    documentPreview: true
  }
};