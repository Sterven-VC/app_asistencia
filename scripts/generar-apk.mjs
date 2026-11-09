import { spawnSync } from 'node:child_process';

// El proyecto aún no usa git, y EAS lo necesita saber.
const resultado = spawnSync(
  'npx',
  ['--yes', 'eas-cli@latest', 'build', '--platform', 'android', '--profile', 'preview', ...process.argv.slice(2)],
  { stdio: 'inherit', shell: true, env: { ...process.env, EAS_NO_VCS: '1' } },
);

process.exit(resultado.status ?? 1);
