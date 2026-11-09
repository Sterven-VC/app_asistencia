import { usePantalla } from '@/disenos/proveedor';
import { usarAdminCuentas } from '@/logica/admin';

export default function Ruta() {
  const vista = usarAdminCuentas();
  const Pantalla = usePantalla('adminCuentas');
  return <Pantalla {...vista} />;
}
