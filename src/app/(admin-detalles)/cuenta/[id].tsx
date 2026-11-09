import { usePantalla } from '@/disenos/proveedor';
import { usarAdminDetalleCuenta } from '@/logica/admin';

export default function Ruta() {
  const vista = usarAdminDetalleCuenta();
  const Pantalla = usePantalla('adminDetalleCuenta');
  return <Pantalla {...vista} />;
}
