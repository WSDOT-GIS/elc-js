export enum RouteTypes {
  SR = 0,
  IS = 1,
  US = 2,
  RA = 3,
  LC = 4,
  FT = 5,
  PR = 6,
  CN = 7,
  TB = 8,
}

export type RouteTypeAbbreviation =
  | "SR"
  | "IS"
  | "US"
  | "RA"
  | "LC"
  | "FT"
  | "PR"
  | "CN"
  | "TB";

const routeTypeAbbrevKeys: RouteTypeAbbreviation[] = [
  "SR",
  "IS",
  "US",
  "RA",
  "LC",
  "FT",
  "PR",
  "CN",
  "TB",
];

const routeClassRe = /^(?:(SR)|(IS)|(US)|(RA)|(LC)|(FT)|(PR)|(CN)|(TB))$/i;

export function getRouteTypeValue(
  value: RouteTypes | RouteTypeAbbreviation
): RouteTypes | null {
  let output: number | null = null;
  if (typeof value === "string") {
    const match = value.match(routeClassRe);
    if (match) {
      if (match[1]) {
        output = RouteTypes.SR;
      } else if (match[2]) {
        output = RouteTypes.IS;
      } else if (match[3]) {
        output = RouteTypes.US;
      } else if (match[4]) {
        output = RouteTypes.RA;
      } else if (match[5]) {
        output = RouteTypes.LC;
      } else if (match[6]) {
        output = RouteTypes.FT;
      } else if (match[7]) {
        output = RouteTypes.PR;
      } else if (match[8]) {
        output = RouteTypes.CN;
      } else if (match[9]) {
        output = RouteTypes.TB;
      }
    }
  } else if (
    typeof value === "number" &&
    Math.trunc(value) === value &&
    value >= 0 &&
    value <= 8
  ) {
    output = value;
  }
  return output;
}

export function getRouteTypeAbbreviation(value: RouteTypes) {
  let output: RouteTypeAbbreviation;

  if (
    typeof value === "number" &&
    value >= 0 &&
    value < routeTypeAbbrevKeys.length
  ) {
    output = RouteTypes[value] as RouteTypeAbbreviation;
  } else if (typeof value === "string" && routeClassRe.test(value)) {
    output = (value as string).toUpperCase() as RouteTypeAbbreviation;
  } else {
    throw new Error("Invalid value");
  }
  return output;
}
