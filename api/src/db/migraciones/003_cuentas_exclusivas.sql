-- El identificador y el rol laboral de las cuentas existentes se conservan.
UPDATE sesiones s SET revocada_en = now()
FROM cuentas c WHERE s.cuenta_id = c.id AND c.es_admin AND s.revocada_en IS NULL;

INSERT INTO eventos_cuenta (cuenta_id, evento, detalle)
SELECT id, 'separacion_admin', jsonb_build_object('rol_personal', rol)
FROM cuentas WHERE es_admin;

ALTER TABLE cuentas
  DROP CONSTRAINT cuentas_dni_key,
  DROP CONSTRAINT cuentas_rol_check,
  DROP COLUMN es_admin,
  ADD CONSTRAINT cuentas_rol_check CHECK (rol IN ('operario', 'administrativo', 'admin')),
  ADD CONSTRAINT cuentas_admin_estado CHECK (rol <> 'admin' OR estado <> 'pendiente');

CREATE UNIQUE INDEX cuentas_dni_por_ambito ON cuentas (dni, (rol = 'admin'));

CREATE FUNCTION impedir_cambio_de_ambito() RETURNS trigger AS $$
BEGIN
  IF (OLD.rol = 'admin') <> (NEW.rol = 'admin') THEN
    RAISE EXCEPTION 'El ámbito de una cuenta es inmutable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ambito_inmutable BEFORE UPDATE OF rol ON cuentas
  FOR EACH ROW EXECUTE FUNCTION impedir_cambio_de_ambito();

CREATE FUNCTION exigir_cuenta_personal() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM cuentas WHERE id = NEW.cuenta_id AND rol = 'admin') THEN
    RAISE EXCEPTION 'El registro requiere una cuenta de personal' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER destino_personal BEFORE INSERT ON marcaciones
  FOR EACH ROW EXECUTE FUNCTION exigir_cuenta_personal();
CREATE TRIGGER destino_personal BEFORE INSERT ON faltas
  FOR EACH ROW EXECUTE FUNCTION exigir_cuenta_personal();
CREATE TRIGGER destino_personal BEFORE INSERT ON correcciones
  FOR EACH ROW EXECUTE FUNCTION exigir_cuenta_personal();
CREATE TRIGGER destino_personal BEFORE INSERT OR UPDATE OF cuenta_id ON pausas
  FOR EACH ROW EXECUTE FUNCTION exigir_cuenta_personal();

CREATE INDEX sesiones_revocables_por_cuenta ON sesiones (cuenta_id) WHERE revocada_en IS NULL;
CREATE INDEX pausas_vigentes_por_cuenta ON pausas (cuenta_id, desde, hasta) WHERE anulada_en IS NULL;
CREATE INDEX marcaciones_por_cuenta_y_hora ON marcaciones (cuenta_id, hora_oficial DESC);
CREATE INDEX validaciones_por_marcacion ON validaciones (marcacion_id, secuencia DESC);
CREATE INDEX faltas_por_cuenta_y_fecha ON faltas (cuenta_id, fecha DESC);
CREATE INDEX correcciones_por_cuenta_y_fecha ON correcciones (cuenta_id, fecha, creado_en DESC);
