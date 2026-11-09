import { type Href, Redirect, Tabs, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

import type { IconoNavegacion, VistaNavegacion } from '@/disenos/contrato';
import { useDiseno } from '@/disenos/proveedor';
import { pausaVigente, useSesion } from '@/services/sesion';

const destinos: { id: string; etiqueta: string; icono: IconoNavegacion; admin: boolean }[] = [
  { id: 'marcar', etiqueta: 'Marcar', icono: 'marcar', admin: false },
  { id: 'historial', etiqueta: 'Historial', icono: 'historial', admin: false },
  { id: 'marcaciones', etiqueta: 'Validar', icono: 'marcaciones', admin: true },
  { id: 'faltas', etiqueta: 'Faltas', icono: 'faltas', admin: true },
  { id: 'cuentas', etiqueta: 'Cuentas', icono: 'cuentas', admin: true },
  { id: 'proyectos', etiqueta: 'Proyectos', icono: 'proyectos', admin: true },
];

type PropsBarra = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

function Barra({ state }: PropsBarra) {
  const router = useRouter();
  const { diseno } = useDiseno();
  const { cuenta, cerrar } = useSesion();
  const admin = cuenta?.rol === 'admin';
  const activa = state.routes[state.index]?.name;
  const items: VistaNavegacion['items'] = destinos
    .filter((d) => d.admin === admin)
    .map((d) => ({
      id: d.id,
      etiqueta: d.etiqueta,
      icono: d.icono,
      activa: activa === d.id,
      ir: () => router.navigate(`/${d.id}` as Href),
    }));
  if (admin) {
    items.push({
      id: 'salir',
      etiqueta: 'Salir',
      icono: 'salir',
      activa: false,
      ir: () => { void cerrar().then(() => router.replace('/')); },
    });
  }
  return <diseno.BarraNavegacion items={items} />;
}

export default function LayoutApp() {
  const { listo, cuenta } = useSesion();
  if (!listo) return null;
  if (!cuenta) return <Redirect href="/" />;
  if (cuenta.estado !== 'activa' || pausaVigente(cuenta)) return <Redirect href="/" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <Barra {...p} />}>
      <Tabs.Protected guard={cuenta.rol !== 'admin'}>
        {destinos.filter((d) => !d.admin).map((d) => (
          <Tabs.Screen key={d.id} name={d.id} />
        ))}
      </Tabs.Protected>
      <Tabs.Protected guard={cuenta.rol === 'admin'}>
        {destinos.filter((d) => d.admin).map((d) => (
          <Tabs.Screen key={d.id} name={d.id} />
        ))}
      </Tabs.Protected>
    </Tabs>
  );
}
