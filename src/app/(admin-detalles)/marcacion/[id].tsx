import { usePantalla } from '@/disenos/proveedor';
import { usarAdminDetalleMarcacion } from '@/logica/admin';

export default function Ruta() {
  const vista = usarAdminDetalleMarcacion();
  const Pantalla = usePantalla('adminDetalleMarcacion');
  return <Pantalla {...vista} />;
}
