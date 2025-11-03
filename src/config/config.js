// Configuración de la API para el frontend
const config = {
  // URL base de la API - cambiar según el entorno
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // Otras configuraciones
  APP_NAME: 'Sistema de Entrega de Equipos',
  VERSION: '1.0.0',
  
  // Configuraciones de la aplicación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  },
  
  // Configuraciones de validación
  VALIDATION: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png']
  }
};

export default config;