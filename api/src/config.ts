import { z } from 'zod';

const esquema = z.object({
  DATABASE_URL: z.string().url().refine((url) => /^postgres(?:ql)?:\/\//.test(url)),
  PUERTO: z.coerce.number().int().min(1).max(65535).default(3000),
  FIN_DE_JORNADA: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).default('18:30'),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  CORS_ORIGENES: z.string().optional().transform((valor, contexto) => {
    if (valor === undefined) return undefined;
    const origenes = valor.split(',').map((origen) => origen.trim()).filter(Boolean);
    for (const origen of origenes) {
      const url = URL.parse(origen);
      if (!url || !['https:', 'http:'].includes(url.protocol) || url.origin !== origen) {
        contexto.addIssue({ code: 'custom', message: 'Escribe orígenes HTTP o HTTPS exactos' });
      }
    }
    return origenes;
  }),
});

const resultado = esquema.safeParse(process.env);
if (!resultado.success) {
  const variables = resultado.error.issues.map((error) => error.path.join('.')).join(', ');
  throw new Error(`Revisa estas variables de la API en api/.env: ${variables}`);
}

export const config = resultado.data;
