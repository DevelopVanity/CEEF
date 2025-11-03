import { User, LogOut } from 'lucide-react';
import './UserHeader.css';

const UserHeader = ({ usuario, onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    onLogout();
  };

  return (
    <div className="user-header">
      <div className="user-info">
        <div className="user-avatar">
          <User size={24} />
        </div>
        <div className="user-details">
          <span className="user-name">{usuario.nombre_completo}</span>
          <span className="user-role">{usuario.puesto} - {usuario.departamento}</span>
        </div>
      </div>
      
      <button onClick={handleLogout} className="logout-button">
        <LogOut size={16} />
        Cerrar Sesión
      </button>
    </div>
  );
};

export default UserHeader;