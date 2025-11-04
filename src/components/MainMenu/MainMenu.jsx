import { NavLink } from 'react-router-dom';
import './MainMenu.css';

const MainMenu = () => {
  return (
    <nav className="main-menu">
      <ul>
        <li><NavLink to="/entregas" className={({isActive}) => isActive ? 'active' : ''}>Entregas</NavLink></li>
        <li><NavLink to="/asignaciones" className={({isActive}) => isActive ? 'active' : ''}>Asignaciones</NavLink></li>
        <li><NavLink to="/mantenimientos" className={({isActive}) => isActive ? 'active' : ''}>Mantenimientos</NavLink></li>
        <li><NavLink to="/bajas" className={({isActive}) => isActive ? 'active' : ''}>Bajas</NavLink></li>
        <li><NavLink to="/movimientos" className={({isActive}) => isActive ? 'active' : ''}>Movimientos</NavLink></li>
        <li><NavLink to="/reportes" className={({isActive}) => isActive ? 'active' : ''}>Reportes</NavLink></li>
      </ul>
    </nav>
  );
};

export default MainMenu;
