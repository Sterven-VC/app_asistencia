import { usePantalla } from '@/disenos/proveedor';
import { usarIniciarSesion } from '@/logica/acceso';

export default function Ruta() {
  const vista = usarIniciarSesion();
  const Pantalla = usePantalla('iniciarSesion');
  return <Pantalla {...vista} />;
}
