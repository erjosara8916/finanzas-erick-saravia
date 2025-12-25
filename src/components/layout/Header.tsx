import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import HerramientasDropdown from './HerramientasDropdown';

export default function Header() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/contacto', label: 'Contacto' },
  ];

  const herramientasItems = [
    { path: '/salud-financiera', label: 'Salud financiera' },
    { path: '/proyeccion-crediticia', label: 'Proyección Crediticia' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span>Finanzas</span>
          </Link>

          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                )}
              >
                {item.label}
              </Link>
            ))}
            <HerramientasDropdown items={herramientasItems} />
          </nav>
        </div>
      </div>
    </header>
  );
}


