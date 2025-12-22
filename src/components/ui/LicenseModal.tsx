import Dialog from './Dialog';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  copyrightOwner?: string;
}

export default function LicenseModal({ isOpen, onClose, copyrightOwner = 'Erick Saravia' }: LicenseModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Licencia MIT">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Copyright (c) {new Date().getFullYear()} {copyrightOwner}
        </p>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia
          de este software y archivos de documentación asociados (el "Software"), para usar el Software
          sin restricción, incluyendo sin limitación los derechos de usar, copiar, modificar, fusionar,
          publicar, distribuir, sublicenciar, y/o vender copias del Software, y a permitir a las personas
          a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:
        </p>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o
          partes sustanciales del Software.
        </p>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA,
          INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO
          PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DEL COPYRIGHT SERÁN
          RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN
          DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, QUE SURJA DE O EN CONEXIÓN CON EL SOFTWARE O
          EL USO U OTROS TRATOS EN EL SOFTWARE.
        </p>
      </div>
    </Dialog>
  );
}

