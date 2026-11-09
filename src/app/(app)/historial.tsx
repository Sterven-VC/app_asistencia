import { usePantalla } from '@/disenos/proveedor';
import { usarHistorial } from '@/logica/marcar';

export default function Ruta() {
  const vista = usarHistorial();
  const Pantalla = usePantalla('historial');
  return <Pantalla {...vista} />;
}
