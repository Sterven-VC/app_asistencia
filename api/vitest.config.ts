import { defineConfig } from 'vitest/config';

const basePruebas = process.env.DATABASE_URL_TEST ?? 'postgres://asistencia@127.0.0.1:5434/asistencia_tmt_test';
if (new URL(basePruebas).pathname !== '/asistencia_tmt_test') {
  throw new Error('Las pruebas requieren la base asistencia_tmt_test');
}

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    fileParallelism: false,
    env: {
      DATABASE_URL: basePruebas,
      FIN_DE_JORNADA: '18:30',
    },
  },
});
