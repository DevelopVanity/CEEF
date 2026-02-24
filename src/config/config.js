const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  APP_NAME: 'Sistema de Entrega de Equipos',
  VERSION: '1.0.0',
  
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  },
  
  VALIDATION: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, 
    SUPPORTED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png']
  }
};

export default config;