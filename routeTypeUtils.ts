
export enum routeTypeAbbrevs {
    SR = 0,
    IS = 1,
    US = 2,
    RA = 3,
    LC = 4,
    FT = 5,
    PR = 6,
    CN = 7,
    TB = 8
}

const routeTypeAbbrevKeys = [
    "SR",
    "IS",
    "US",
    "RA",
    "LC",
    "FT",
    "PR",
    "CN",
    "TB"
];

const routeClassRe = /^(?:(SR)|(IS)|(US)|(RA)|(LC)|(FT)|(PR)|(CN)|(TB))$/i;

export function getRouteTypeValue(value: string | number): number | null {
    let output: number | null = null;
    if (typeof value === "string") {
        const match = value.match(routeClassRe);
        if (match) {
            if (match[1]) {
                output = routeTypeAbbrevs.SR;
            } else if (match[2]) {
                output = routeTypeAbbrevs.IS;
            } else if (match[3]) {
                output = routeTypeAbbrevs.US;
            } else if (match[4]) {
                output = routeTypeAbbrevs.RA;
            } else if (match[5]) {
                output = routeTypeAbbrevs.LC;
            } else if (match[6]) {
                output = routeTypeAbbrevs.FT;
            } else if (match[7]) {
                output = routeTypeAbbrevs.PR;
            } else if (match[8]) {
                output = routeTypeAbbrevs.CN;
            } else if (match[9]) {
                output = routeTypeAbbrevs.TB;
            }
        }
    } else if (typeof value === "number" && Math.trunc(value) === value && (value >= 0 && value <= 8)) {
        output = value;
    }
    return output;
}

export function getRouteTypeAbbreviation(value: routeTypeAbbrevs) {
    let output: string;

    if (typeof value === "number" && value >= 0 && value < routeTypeAbbrevKeys.length) {
        output = routeTypeAbbrevs[value];
    } else if (typeof value === "string" && routeClassRe.test(value)) {
        output = (value as string).toUpperCase();
    } else {
        throw new Error("Invalid value");
    }
    return output;
}
