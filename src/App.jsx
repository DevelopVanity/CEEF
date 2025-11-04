import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EntregaEquipo from './pages/EntregaEquipo/EntregaEquipo';
import Login from './pages/Login/Login';
import UserHeader from './components/UserHeader/UserHeader';
import MainMenu from './components/MainMenu/MainMenu';
import Reportes from './pages/Reportes/Reportes';
import Bajas from './pages/Bajas/Bajas';
import Mantenimiento from './pages/Mantenimiento/Mantenimiento';
import Movimientos from './pages/Movimientos/Movimientos';
import Asignaciones from './pages/Asignaciones/Asignaciones';
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
        <BrowserRouter>
          <div className="app-content">
            <UserHeader usuario={usuario} onLogout={handleLogout} />
            <MainMenu />
            <main className="main-area">
              <Routes>
                <Route path="/entregas" element={<EntregaEquipo usuario={usuario} />} />
                <Route path="/asignaciones" element={<Asignaciones />} />
                <Route path="/mantenimientos" element={<Mantenimiento />} />
                <Route path="/bajas" element={<Bajas />} />
                <Route path="/movimientos" element={<Movimientos />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/" element={<Navigate to="/entregas" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App
