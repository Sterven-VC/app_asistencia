import { usePantalla } from '@/disenos/proveedor';
import { usarAdminMarcaciones } from '@/logica/admin';

export default function Ruta() {
  const vista = usarAdminMarcaciones();
  const Pantalla = usePantalla('adminMarcaciones');
  return <Pantalla {...vista} />;
}
