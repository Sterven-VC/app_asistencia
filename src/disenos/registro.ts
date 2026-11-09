import type { Diseno, IdDiseno } from './contrato';
import { diseno as frontendDesign } from './frontend-design';
import { diseno as impeccable } from './impeccable';
import { diseno as uiUxProMax } from './ui-ux-pro-max';

export const disenos: Record<IdDiseno, Diseno> = {
  'ui-ux-pro-max': uiUxProMax,
  impeccable,
  'frontend-design': frontendDesign,
};

export const ordenDisenos: IdDiseno[] = ['ui-ux-pro-max', 'impeccable', 'frontend-design'];

export const fuentesDeTodos: Record<string, number> = Object.assign(
  {},
  ...ordenDisenos.map((id) => disenos[id].fuentes),
);
