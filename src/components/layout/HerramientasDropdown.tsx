import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface HerramientaItem {
  path: string;
  label: string;
}

interface HerramientasDropdownProps {
  items: HerramientaItem[];
}

export default function HerramientasDropdown({ items }: HerramientasDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAnyItemActive = items.some((item) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(item.path);
  });

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar dropdown al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => {
        // Solo activar hover en dispositivos no táctiles
        if (window.matchMedia('(hover: hover)').matches) {
          setIsOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (window.matchMedia('(hover: hover)').matches) {
          setIsOpen(false);
        }
      }}
    >
      <button
        onClick={toggleDropdown}
        className={cn(
          'px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap',
          isAnyItemActive
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="hidden sm:inline">Herramientas</span>
        <span className="sm:hidden">Herramientas</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform flex-shrink-0',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 sm:right-auto sm:left-0 pt-1 z-50 min-w-[200px] sm:w-56 max-w-[calc(100vw-2rem)]">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1">
            {items.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-4 py-2 text-sm transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

