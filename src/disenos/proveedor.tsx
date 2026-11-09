import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { guardar, leer } from '@/services/almacen';
import type { Diseno, IdDiseno, Pantallas } from './contrato';
import { disenos, ordenDisenos } from './registro';

const CLAVE = 'diseno_activo';

type ContextoDiseno = {
  diseno: Diseno;
  siguiente(): void;
};

const Contexto = createContext<ContextoDiseno | null>(null);

export function ProveedorDiseno({ children }: { children: ReactNode }) {
  const [id, setId] = useState<IdDiseno>(ordenDisenos[0]);

  useEffect(() => {
    void leer(CLAVE).then((guardado) => {
      if (guardado && guardado in disenos) setId(guardado as IdDiseno);
    });
  }, []);

  const siguiente = useCallback(() => {
    setId((actual) => {
      const nuevo = ordenDisenos[(ordenDisenos.indexOf(actual) + 1) % ordenDisenos.length];
      void guardar(CLAVE, nuevo);
      return nuevo;
    });
  }, []);

  const valor = useMemo(() => ({ diseno: disenos[id], siguiente }), [id, siguiente]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useDiseno() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('Falta ProveedorDiseno');
  return valor;
}

export function usePantalla<K extends keyof Pantallas>(nombre: K): Pantallas[K] {
  return useDiseno().diseno.pantallas[nombre];
}
