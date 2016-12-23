export const LRS_TYPE_INCREASE = 1;
export const LRS_TYPE_DECREASE = 2;
export const LRS_TYPE_BOTH = 3;
export const LRS_TYPE_RAMP = 4;
export const LRS_TYPE_FT = 8;
export const LRS_TYPE_TURNBACK = 0x10;

/**
 * Returns the numerical value.
 * @param value - either a number or a string
 * @returns Returns the number corresponding to the input value. If the input is a valid number, the same value is returned.
 */
export function getLrsTypeValue(value: number | string): number