import { usePantalla } from '@/disenos/proveedor';
import { usarCuentaNoActiva } from '@/logica/acceso';

export default function Ruta() {
  const vista = usarCuentaNoActiva();
  const Pantalla = usePantalla('cuentaNoActiva');
  return <Pantalla {...vista} />;
}
