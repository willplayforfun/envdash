import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../NavConfig'

// Navigation component using React Router and Tailwind
function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const linkClass = (path) => 
    `px-4 py-2 rounded transition-colors duration-200 no-underline inline-block ${
      isActive(path) 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
    }`;
  
  return (
    <nav className="p-3 bg-gray-100 border-b border-gray-300">
      <Link to={ROUTES.MAP.path} className={`${linkClass(ROUTES.MAP.path)} mr-3`}>
        {ROUTES.MAP.name}
      </Link>
      <Link to={ROUTES.DATA.path} className={linkClass(ROUTES.DATA.path)}>
        {ROUTES.DATA.name}
      </Link>
      <Link to={ROUTES.TEST.path} className={`${linkClass(ROUTES.TEST.path)} ml-3`}>
        {ROUTES.TEST.name}
      </Link>
    </nav>
  );
}

export default Navigation;