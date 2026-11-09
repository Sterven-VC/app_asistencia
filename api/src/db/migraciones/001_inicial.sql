CREATE TABLE cuentas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dni char(8) NOT NULL UNIQUE CHECK (dni ~ '^[0-9]{8}$'),
  nombre_1 text NOT NULL,
  nombre_2 text,
  apellido_paterno text NOT NULL,
  apellido_materno text NOT NULL,
  numero_referencia text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('operario', 'administrativo')),
  es_admin boolean NOT NULL DEFAULT false,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activa', 'desactivada')),
  contrasena_hash text NOT NULL,
  intentos_fallidos integer NOT NULL DEFAULT 0,
  bloqueada_hasta timestamptz,
  creada_en timestamptz NOT NULL DEFAULT now(),
  aprobada_en timestamptz
);

CREATE TABLE sesiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_id uuid NOT NULL REFERENCES cuentas (id),
  token_hash text NOT NULL UNIQUE,
  creada_en timestamptz NOT NULL DEFAULT now(),
  expira_en timestamptz NOT NULL,
  revocada_en timestamptz
);

CREATE TABLE eventos_cuenta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_id uuid NOT NULL REFERENCES cuentas (id),
  evento text NOT NULL,
  detalle jsonb NOT NULL DEFAULT '{}',
  autor_id uuid REFERENCES cuentas (id),
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pausas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_id uuid NOT NULL REFERENCES cuentas (id),
  desde date NOT NULL,
  hasta date NOT NULL CHECK (hasta >= desde),
  autor_id uuid NOT NULL REFERENCES cuentas (id),
  creada_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE proyectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean NOT NULL DEFAULT true,
  creado_por uuid NOT NULL REFERENCES cuentas (id),
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE marcaciones (
  id uuid PRIMARY KEY,
  cuenta_id uuid NOT NULL REFERENCES cuentas (id),
  clase text NOT NULL CHECK (clase IN ('entrada', 'salida')),
  fecha_laboral date NOT NULL,
  hora_telefono timestamptz NOT NULL,
  hora_recepcion timestamptz NOT NULL,
  desfase_segundos integer NOT NULL,
  hora_oficial timestamptz NOT NULL,
  sin_conexion boolean NOT NULL,
  latitud double precision,
  longitud double precision,
  precision_m double precision,
  motivo_sin_ubicacion text CHECK (motivo_sin_ubicacion IN ('sin_permiso', 'sin_gps', 'tiempo_agotado')),
  es_repetida boolean NOT NULL DEFAULT false,
  minutos_extra integer NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX marcaciones_unica_por_dia
  ON marcaciones (cuenta_id, fecha_laboral, clase) WHERE NOT es_repetida;
CREATE INDEX marcaciones_por_fecha ON marcaciones (fecha_laboral);

CREATE TABLE observaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marcacion_id uuid NOT NULL REFERENCES marcaciones (id),
  codigo text NOT NULL CHECK (
    codigo IN ('sin_ubicacion', 'salida_faltante', 'cuenta_no_activa', 'marcacion_repetida')
  ),
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (marcacion_id, codigo)
);

CREATE TABLE validaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secuencia bigserial NOT NULL,
  marcacion_id uuid NOT NULL REFERENCES marcaciones (id),
  decision text NOT NULL CHECK (decision IN ('aprobada', 'rechazada')),
  tipo text CHECK (tipo IN ('proyecto', 'oficina', 'cita_medica')),
  proyecto_id uuid REFERENCES proyectos (id),
  motivo text,
  automatica boolean NOT NULL DEFAULT false,
  autor_id uuid NOT NULL REFERENCES cuentas (id),
  creado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (decision <> 'rechazada' OR length(trim(motivo)) > 0),
  CHECK (tipo IS DISTINCT FROM 'proyecto' OR proyecto_id IS NOT NULL)
);

CREATE TABLE faltas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_id uuid NOT NULL REFERENCES cuentas (id),
  fecha date NOT NULL,
  origen text NOT NULL CHECK (origen IN ('sin_marcacion', 'rechazo', 'correccion')),
  marcacion_id uuid REFERENCES marcaciones (id),
  creada_en timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX faltas_unica_por_origen
  ON faltas (cuenta_id, fecha, origen) WHERE origen <> 'correccion';

CREATE TABLE anulaciones_falta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  falta_id uuid NOT NULL UNIQUE REFERENCES faltas (id),
  motivo text NOT NULL,
  origen text NOT NULL CHECK (origen IN ('marcacion_tardia', 'correccion')),
  autor_id uuid REFERENCES cuentas (id),
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE correcciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_id uuid NOT NULL REFERENCES cuentas (id),
  fecha date NOT NULL,
  es_falta_anterior boolean NOT NULL,
  es_falta_nuevo boolean NOT NULL,
  motivo text NOT NULL CHECK (length(trim(motivo)) > 0),
  autor_id uuid NOT NULL REFERENCES cuentas (id),
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cierres_dia (
  fecha date PRIMARY KEY,
  ejecutado_en timestamptz NOT NULL DEFAULT now()
);

-- Registro inalterable: la regla vive en la base, no depende de la API.
CREATE FUNCTION rechazar_cambio() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Registro inalterable: % en %', TG_OP, TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inalterable BEFORE UPDATE OR DELETE ON marcaciones
  FOR EACH ROW EXECUTE FUNCTION rechazar_cambio();
CREATE TRIGGER inalterable BEFORE UPDATE OR DELETE ON observaciones
  FOR EACH ROW EXECUTE FUNCTION rechazar_cambio();
CREATE TRIGGER inalterable BEFORE UPDATE OR DELETE ON validaciones
  FOR EACH ROW EXECUTE FUNCTION rechazar_cambio();
CREATE TRIGGER inalterable BEFORE UPDATE OR DELETE ON correcciones
  FOR EACH ROW EXECUTE FUNCTION rechazar_cambio();
CREATE TRIGGER inalterable BEFORE UPDATE OR DELETE ON faltas
  FOR EACH ROW EXECUTE FUNCTION rechazar_cambio();
CREATE TRIGGER inalterable BEFORE UPDATE OR DELETE ON anulaciones_falta
  FOR EACH ROW EXECUTE FUNCTION rechazar_cambio();
CREATE TRIGGER inalterable BEFORE UPDATE OR DELETE ON eventos_cuenta
  FOR EACH ROW EXECUTE FUNCTION rechazar_cambio();

CREATE VIEW marcaciones_vigentes AS
SELECT
  m.*,
  c.rol,
  c.dni,
  concat_ws(' ', c.nombre_1, c.apellido_paterno, c.apellido_materno) AS persona,
  COALESCE(u.decision, 'pendiente') AS estado,
  t.tipo,
  t.proyecto_id,
  p.nombre AS proyecto,
  u.motivo,
  COALESCE(u.automatica OR a.hay, false) AS automatica,
  COALESCE(o.codigos, ARRAY[]::text[]) AS observaciones
FROM marcaciones m
JOIN cuentas c ON c.id = m.cuenta_id
LEFT JOIN LATERAL (
  SELECT v.decision, v.motivo, v.automatica FROM validaciones v
  WHERE v.marcacion_id = m.id ORDER BY v.secuencia DESC LIMIT 1
) u ON true
LEFT JOIN LATERAL (
  SELECT v.tipo, v.proyecto_id FROM validaciones v
  WHERE v.marcacion_id = m.id AND v.tipo IS NOT NULL ORDER BY v.secuencia DESC LIMIT 1
) t ON true
LEFT JOIN LATERAL (
  SELECT true AS hay FROM validaciones v WHERE v.marcacion_id = m.id AND v.automatica LIMIT 1
) a ON true
LEFT JOIN proyectos p ON p.id = t.proyecto_id
LEFT JOIN LATERAL (
  SELECT array_agg(codigo ORDER BY creado_en) AS codigos FROM observaciones WHERE marcacion_id = m.id
) o ON true;
