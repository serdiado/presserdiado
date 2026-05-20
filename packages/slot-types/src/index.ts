import type { Slot, SlotContent, SlotRole } from '@matbaapro/shared';

/**
 * Slot state machine transitions.
 */
export type SlotState = 'empty' | 'product' | 'custom' | 'free';

export function getSlotState(slot: Slot): SlotState {
  if (slot.content === null) return 'empty';
  if (slot.role === 'free') return 'free';
  if (slot.role === 'custom') return 'custom';
  return 'product';
}

export interface SlotTransition {
  from: SlotState;
  to: SlotState;
  action: string;
}

const VALID_TRANSITIONS: SlotTransition[] = [
  { from: 'empty', to: 'product', action: 'add-product' },
  { from: 'empty', to: 'free', action: 'make-free' },
  { from: 'product', to: 'custom', action: 'customize' },
  { from: 'product', to: 'empty', action: 'remove-content' },
  { from: 'product', to: 'product', action: 'swap' },
  { from: 'custom', to: 'empty', action: 'remove-content' },
  { from: 'custom', to: 'product', action: 'reset-to-global' },
  { from: 'free', to: 'empty', action: 'remove-content' },
];

export function canTransition(from: SlotState, to: SlotState, action: string): boolean {
  return VALID_TRANSITIONS.some((t) => t.from === from && t.to === to && t.action === action);
}

/**
 * Swap content between two slots.
 */
export function swapSlotContent(
  source: Slot,
  target: Slot,
): { source: Slot; target: Slot } {
  return {
    source: { ...source, content: target.content },
    target: { ...target, content: source.content },
  };
}

/**
 * Validate that a slot's content matches its role.
 */
export function validateSlotContent(role: SlotRole, content: SlotContent | null): boolean {
  if (content === null) return true;
  if (role === 'free' && content.type !== 'free') return false;
  if ((role === 'global' || role === 'custom') && content.type !== 'product') return false;
  return true;
}
