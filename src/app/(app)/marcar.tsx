import { usePantalla } from '@/disenos/proveedor';
import { usarMarcar } from '@/logica/marcar';

export default function Ruta() {
  const vista = usarMarcar();
  const Pantalla = usePantalla('marcar');
  return <Pantalla {...vista} />;
}
