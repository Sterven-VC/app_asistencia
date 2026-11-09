import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type {
  CamposRegistro,
  VistaCuentaNoActiva,
  VistaIniciarSesion,
  VistaRegistro,
} from '@/disenos/contrato';
import { cambiarServidor, mensajeDeError, obtenerServidor, pedir } from '@/services/api';
import { pausaVigente, useSesion } from '@/services/sesion';

export function usarIniciarSesion(): VistaIniciarSesion {
  const router = useRouter();
  const { iniciar } = useSesion();
  const [identificador, setIdentificador] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servidor, setServidor] = useState('');
  const [servidorGuardado, setServidorGuardado] = useState(false);

  useEffect(() => {
    void obtenerServidor().then(setServidor);
  }, []);

  const enviar = async () => {
    const usuario = identificador.trim().toLowerCase();
    if (!/^(?:admin\.)?\d{8}$/.test(usuario) || !contrasena) {
      setError('Escribe tu DNI o usuario admin y tu contraseña.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      if (servidor.trim()) await cambiarServidor(servidor);
      await iniciar(usuario, contrasena);
      router.replace('/');
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return {
    identificador,
    cambiarIdentificador: setIdentificador,
    contrasena,
    cambiarContrasena: setContrasena,
    enviar: () => void enviar(),
    enviando,
    error,
    irARegistro: () => router.push('/registro'),
    servidor,
    cambiarServidor: (v) => {
      setServidor(v);
      setServidorGuardado(false);
    },
    guardarServidor: () => {
      setError(null);
      void cambiarServidor(servidor)
        .then(() => setServidorGuardado(true))
        .catch((e) => setError(mensajeDeError(e)));
    },
    servidorGuardado,
  };
}

const camposVacios: CamposRegistro = {
  dni: '',
  nombre_1: '',
  nombre_2: '',
  apellido_paterno: '',
  apellido_materno: '',
  numero_referencia: '',
  rol: null,
  contrasena: '',
  confirmar: '',
};

function validar(c: CamposRegistro) {
  const errores: VistaRegistro['errores'] = {};
  if (!/^\d{8}$/.test(c.dni)) errores.dni = 'Debe tener 8 dígitos';
  if (!c.nombre_1.trim()) errores.nombre_1 = 'Escribe tu primer nombre';
  if (!c.apellido_paterno.trim()) errores.apellido_paterno = 'Escribe tu apellido paterno';
  if (!c.apellido_materno.trim()) errores.apellido_materno = 'Escribe tu apellido materno';
  if (!c.numero_referencia.trim()) errores.numero_referencia = 'Escribe un número de referencia';
  if (!c.rol) errores.rol = 'Elige tu tipo de personal';
  if (c.contrasena.length < 8) errores.contrasena = 'Usa al menos 8 caracteres';
  if (c.confirmar !== c.contrasena) errores.confirmar = 'Las contraseñas no coinciden';
  return errores;
}

export function usarRegistro(): VistaRegistro {
  const router = useRouter();
  const [campos, setCampos] = useState(camposVacios);
  const [errores, setErrores] = useState<VistaRegistro['errores']>({});
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  const enviar = async () => {
    const encontrados = validar(campos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    setEnviando(true);
    setError(null);
    try {
      const { confirmar: _confirmar, ...cuerpo } = campos;
      await pedir('/auth/registro', { metodo: 'POST', cuerpo, sesion: null });
      setRegistrado(true);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return {
    campos,
    cambiar: (campo, valor) => {
      const limpio = campo === 'dni' ? (String(valor).replace(/\D/g, '').slice(0, 8) as typeof valor) : valor;
      setCampos((c) => ({ ...c, [campo]: limpio }));
      setErrores((e) => ({ ...e, [campo]: undefined }));
    },
    errores,
    error,
    enviar: () => void enviar(),
    enviando,
    registrado,
    irAInicio: () => router.replace('/iniciar-sesion'),
  };
}

export function usarCuentaNoActiva(): VistaCuentaNoActiva {
  const router = useRouter();
  const { cuenta, actualizar, cerrar } = useSesion();
  const [actualizando, setActualizando] = useState(false);
  const pausa = cuenta ? pausaVigente(cuenta) : null;

  const refrescar = useCallback(async () => {
    setActualizando(true);
    await actualizar();
    setActualizando(false);
    router.replace('/');
  }, [actualizar, router]);

  return {
    motivo: cuenta?.estado === 'pendiente' ? 'pendiente' : pausa ? 'pausada' : 'desactivada',
    nombre: cuenta?.nombre_1 ?? '',
    hasta: pausa?.hasta ?? null,
    actualizar: () => void refrescar(),
    actualizando,
    cerrarSesion: () => {
      void cerrar().then(() => router.replace('/'));
    },
  };
}
