/**
 * Converts a value into a number.  Similar to passing a value into the Number() function, except that this function will throw an error if
 * the value cannot be converted to a number, whereas Number() will return NaN.  If null or undefined are passed in, they will also be returned.
 * @param {(number|string)} value - A value that can be converted into a number.  If a number is passed in, the same number will be returned (unless that number is NaN).
 * @param {string="this"} [propName] - A property name that is only used when value cannot be converted to a number.
 * @returns {(number|null|undefined)} If null or undefined are passed in, the same value will be returned.  Otherwise the number equivalent of "value" is returned.
 * @throws {Error} Thrown if "value" cannot be converted into a number (and is not null or undefined).
 */
export function toNumber(value: number | string, propName: string | null | undefined) {
    let output;
    // If a property name is not provided, set the name to "this" for the error message (if necessary).
    if (propName === null || typeof propName === "undefined") {
        propName = "this";
    }
    // Make sure that if ID is provided it is a number or convertible to a number.
    if (typeof value !== "undefined" && value !== null) {
        // Convert value to a number.  Something like "abc" can't be converted and will result in NaN, in which case an error is thrown.
        value = Number(value);
        if (isNaN(value)) {
            throw new Error(`If ${propName} property is provided, it must be a number.`);
        }
        output = value;
    } else if (value === null) {
        return null;
    }

    return output;
}

/**
 * Returns the month component of a Date object as an integer.
 * For some reason JavaScript's Date.getMonth() method returns a zero-based month integer (i.e., Jan = 0, Feb = 1, etc.) instead of the way
 * almost every culture on Earth would expect (i.e., Jan = 1, Feb = 2, etc.).  This method returns it the correct way.
 * @author Jeff Jacobson
 * @param {Date} date - A Date object
 * @return {number} Returns the number that humans use to represent the Date's month (Date.getMonth() + 1).
 */
export function getActualMonth(date: Date): number {
    return date.getMonth() + 1;
}

/**
 * If an array is a jagged-array, this function will "flatten" the array into a regular array.
 * @author Jeff Jacobson
 * @param {Array} array An array.
 * @return {Array} A flattened version of the input array.
 * @exception {Error} Thrown if array is not an object of type Array.
 * @memberOf $.wsdot.elc
 */
export function flattenArray(array: any[]): any[] {
    if (typeof array === "undefined" || array === null) {
        return array;
    }
    if (typeof array !== "object" || !(array instanceof Array)) {
        throw new Error("array must be an Array object.");
    }

    const outArray = [];

    for (let i = 0, l = array.length; i < l; i += 1) {
        const element = array[i];
        if (typeof element === "object" && element instanceof Array) {
            const array2 = flattenArray(element);
            for (let j = 0, jl = array2.length; j < jl; j += 1) {
                outArray.push(array2[j]);
            }
        } else {
            outArray.push(element);
        }
    }

    return outArray;
}
