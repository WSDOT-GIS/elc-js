
/**
 * Converts a value into a number.  Similar to passing a value into the Number() function, except that this function will throw an error if
 * the value cannot be converted to a number, whereas Number() will return NaN.  If null or undefined are passed in, they will also be returned.
 * @param value - A value that can be converted into a number.  If a number is passed in, the same number will be returned (unless that number is NaN).
 * @param [propName="this"] - A property name that is only used when value cannot be converted to a number.
 * @returns If null or undefined are passed in, the same value will be returned.  Otherwise the number equivalent of "value" is returned.
 * @throws {Error} Thrown if "value" cannot be converted into a number (and is not null or undefined).
 */
export function toNumber(value: number | string, propName?: string): number | null | undefined
/**
 * Returns the month component of a Date object as an integer.
 * For some reason JavaScript's Date.getMonth() method returns a zero-based month integer
 * (i.e., Jan = 0, Feb = 1, etc.) instead of the way almost every culture on Earth would
 * expect (i.e., Jan = 1, Feb = 2, etc.).  This method returns it the correct way.
 * @param date - A Date object
 * @return Returns the number that humans use to represent the Date's month (Date.getMonth() + 1).
 */
export function toActualMonth(date: Date): number
/**
 * If an array is a jagged-array, this function will "flatten" the array into a regular array.
 * @param {Array} array An array.
 * @return {Array} A flattened version of the input array.
 * @throws {Error} Thrown if array is not an object of type Array.
 */
export function flattenArray(array: any[]): any[]