import { usePantalla } from '@/disenos/proveedor';
import { usarRegistro } from '@/logica/acceso';

export default function Ruta() {
  const vista = usarRegistro();
  const Pantalla = usePantalla('registro');
  return <Pantalla {...vista} />;
}
