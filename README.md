CEEF — Frontend (React + Vite)

Descripción
- Frontend para el Sistema de Entrega de Equipos. Implementado con React + Vite. Provee interfaz para autenticación, captura de entregas, generación de PDFs en el cliente y flujo de firma digital demo.

Requisitos
- Node.js >= 16
- npm, pnpm o yarn

Comandos principales
- Instalar dependencias:

    npm install
    # o con pnpm
    pnpm install

- Ejecutar en desarrollo (Vite HMR):

    npm run dev

- Build de producción:

    npm run build

- Previsualizar build:

    npm run preview

Configuración / variables de entorno
- VITE_API_URL — URL base del backend (por ejemplo http://localhost:3001/api). Puedes crear un archivo .env con esa variable.

Estructura relevante (resumen)
- src/main.jsx — entry point de la app.
- src/App.jsx — control de sesión y render principal (login vs app).
- src/pages/Login/ — pantalla de autenticación (POST /auth/login).
- src/pages/EntregaEquipo/ — formulario para crear entregas, manejar equipos y generar PDFs.
- src/services/EntregaEquipoService.js — funciones que consumen la API (/entrega-equipo).
- src/utils/pdfGenerator.js — generación de PDF en cliente con jspdf y jspdf-autotable.
- src/components/Signer/ — componente demo para generación de claves ECDSA, subida de clave pública, solicitud de nonce y firma de PDFs.

Flujo principal (resumen)
1. Login: el usuario hace POST ${"VITE_API_URL" || 'http://localhost:3001/api'}/auth/login y se guarda el usuario en localStorage.
2. Crear entrega: completar el formulario en EntregaEquipo → EntregaEquipoService.crearEntrega() → POST /entrega-equipo.
3. Generar PDF: el frontend puede generar y descargar el PDF localmente con pdfGenerator.
4. Firma digital (demo):
   - Generar par ECDSA en el cliente (Signer), descargar la privada y subir la pública a POST /entrega-equipo/user/:userId/public-key.
   - Solicitar nonce con POST /entrega-equipo/:id/challenge.
   - Firmar el payload canónico (entregaId, userId, documentHash, nonce) en el cliente y enviar la firma a POST /entrega-equipo/:id/sign.
   - El backend verifica la firma usando la clave pública registrada y almacena el resultado.

Notas y recomendaciones
- El componente Signer es un demo; en producción hay que validar la estrategia de gestión de claves.
- Verificar que VITE_API_URL apunte al backend correcto antes de probar integraciones.
- Usuarios de ejemplo en UI: admin / password123, ing.soporte / password123, tecnico1 / password123.

Dependencias claves
- react, react-dom, react-router-dom, react-hook-form.
- jspdf, jspdf-autotable para generación de PDFs.
- date-fns para formateo de fechas.

Siguientes pasos recomendados
- Implementar autenticación con tokens (JWT) y proteger rutas.
- Validar roles/permiso en frontend y backend.
- Considerar generación/archivo de PDFs en backend si se requiere almacenado central o firmas server-side.
