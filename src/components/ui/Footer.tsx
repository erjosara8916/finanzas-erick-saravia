import { useState } from 'react';
import LicenseModal from './LicenseModal';

interface FooterProps {
  copyrightOwner?: string;
  copyrightYear?: number;
  ownerWebsite?: string;
}

export default function Footer({ 
  copyrightOwner = 'Erick Saravia',
  copyrightYear = new Date().getFullYear(),
  ownerWebsite = 'https://resume.ericksaravia.com/'
}: FooterProps) {
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);

  return (
    <>
      <footer className="relative md:fixed md:bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 mt-auto">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="text-center">
              © {copyrightYear}{' '}
              <a
                href={ownerWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline transition-colors"
              >
                {copyrightOwner}
              </a>
              . Todos los derechos reservados.
            </div>
           {/*  <div>
              <button
                onClick={() => setIsLicenseOpen(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline transition-colors"
              >
                Licencia MIT
              </button>
            </div> */}
          </div>
        </div>
      </footer>
      <LicenseModal 
        isOpen={isLicenseOpen} 
        onClose={() => setIsLicenseOpen(false)} 
        copyrightOwner={copyrightOwner}
      />
    </>
  );
}

