export enum LrsType {
    INCREASE = 1,
    DECREASE = 2,
    BOTH = 3,
    RAMP = 4,
    FT = 8,
    TURNBACK = 0x10
}

/**
 * Returns the numerical value.
 * @param value - either a number or a string
 * @returns Returns the number corresponding to the input value. If the input is a valid number, the same value is returned.
 * @throws {Error} Throws an error if the input value is an unexpected value.
 */
export function getLrsTypeValue(value: number | string): number {
    let output: number | string | null = null;
    if (typeof value === "string") {
        if (/^i/i.test(value)) {
            output = LrsType.INCREASE;
        } else if (/^d/i.test(value)) {
            output = LrsType.DECREASE;
        } else if (/^b/i.test(value)) {
            output = LrsType.BOTH;
        } else if (/^r/i.test(value)) {
            output = LrsType.RAMP;
        } else if (/^f/i.test(value)) {
            output = LrsType.FT;
        } else if (/t/i.test(value)) {
            output = LrsType.TURNBACK;
        } else {
            throw new Error(`Invalid value: ${value}`);
        }
    } else if (typeof value === "number" && (value >= 1 && value <= 4) || (value === 8 || value === 16)) {
        output = value;
    } else {
        throw new Error(`Invalid value: ${value}`);
    }

    return output;
}
