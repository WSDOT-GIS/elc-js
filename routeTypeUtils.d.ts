type routeTypeAbbrevs = "SR" | "IS" | "US" | "RA" | "LC" | "FT" | "PR" | "CN" | "TB";

export function getRouteTypeValue(value: string | number): number | null
export function getRouteTypeAbbreviation(value: number | routeTypeAbbrevs): routeTypeAbbrevs
