import { usePantalla } from '@/disenos/proveedor';
import { usarAdminFaltas } from '@/logica/admin';

export default function Ruta() {
  const vista = usarAdminFaltas();
  const Pantalla = usePantalla('adminFaltas');
  return <Pantalla {...vista} />;
}
