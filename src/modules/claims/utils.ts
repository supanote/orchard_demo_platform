import type { Claim, Stage } from './types';

export const formatCurrency = (amount: number) => `$${amount}`;

export const findStage = (stages: Stage[], stageId: Claim['stage']) =>
  stages.find((stage) => stage.id === stageId);

export const toggleItem = <T>(list: T[], item: T) =>
  list.includes(item) ? list.filter((value) => value !== item) : [...list, item];

