import { usePantalla } from '@/disenos/proveedor';
import { usarAdminProyectos } from '@/logica/admin';

export default function Ruta() {
  const vista = usarAdminProyectos();
  const Pantalla = usePantalla('adminProyectos');
  return <Pantalla {...vista} />;
}
