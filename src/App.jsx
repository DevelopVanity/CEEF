import { useState, useEffect } from 'react';
import EntregaEquipo from './pages/EntregaEquipo/EntregaEquipo';
import Login from './pages/Login/Login';
import UserHeader from './components/UserHeader/UserHeader';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar la app
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        console.error('Error al parsear usuario guardado:', error);
        localStorage.removeItem('usuario');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const handleLogout = () => {
    setUsuario(null);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {usuario ? (
        <div className="app-content">
          <UserHeader usuario={usuario} onLogout={handleLogout} />
          <EntregaEquipo usuario={usuario} />
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App
