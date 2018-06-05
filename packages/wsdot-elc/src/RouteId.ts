/**
 * Represents a WSDOT State Route Identifier
 * @module RouteId
 */

import FormatError from "./FormatError";

/**
 * Matches a state route ID.  Regex.exec will return an array with four elements: the entire route name, SR, RRT, and RRQ
 * @author Jeff Jacobson
 */
// routeRe = /^(\d{3})(?:((?:AR)|(?:[CH][DI])|(?:C[O])|(?:F[DI])|(?:LX)|(?:[PQRS][\dU])|(?:RL)|(?:SP)|(?:TB)|(?:TR)|(?:PR)|(?:F[UST])|(?:ML)|(?:UC))([A-Z0-9]{0,6}))?$/i;
export const routeRe = /^(\d{3})(?:([A-Z0-9]{2})([A-Z0-9]{0,6}))?/i;
/*
== RRTs (Related Roadway Type)==
AR Alternate Route
CD Collector Distributor (Dec)
CI Collector Distributor (Inc)
CO Couplet
FI Frontage Road (Inc)
FD Frontage Road (Dec)
LX Crossroad within Interchange
RL Reversible Lane
SP Spur
TB Transitional Turnback
TR Temporary Route
PR Proposed Route

UC Under Construction

===Ramps===
P1 - P9 Off Ramp (Inc)
PU Extension of P ramp
Q1 - Q9 On Ramp (Inc)
QU Extension of Q ramp
R1 - R9 Off Ramp (Dec)
RU Extension of R ramp
S1 - S9 On Ramp (Dec)
SU Extension of S ramp

==Ferries==
FS Ferry Ship (Boat)
FT Ferry Terminal

*/

const rrtDefinitions: { [rrt: string]: string } = {
  AR: "Alternate Route",
  CD: "Collector Distributor (Dec)",
  CO: "Couplet",
  CI: "Collector Distributor (Inc)",
  FI: "Frontage Road (Inc)",
  FD: "Frontage Road (Dec)",
  LX: "Crossroad within Interchange",
  RL: "Reversible Lane",
  SP: "Spur",
  TB: "Transitional Turnback",
  TR: "Temporary Route",
  PR: "Proposed Route",
  FS: "Ferry Ship (Boat)",
  FT: "Ferry Terminal",
  UC: "Under Construction",
  HI: "Grade-Separated HOV (Inc)",
  HD: "Grade-Separated HOV (Dec)"
};

const rampTypes: { [rampType: string]: string } = {
  P: "Off Ramp (Inc)",
  Q: "On Ramp (Inc)",
  R: "Off Ramp (Dec)",
  S: "On Ramp (Dec)"
};

for (const key in rampTypes) {
  if (rampTypes.hasOwnProperty(key)) {
    const desc = rampTypes[key];
    let newKey: string;
    for (let i = 1, l = 10; i < l; i += 1) {
      newKey = `${key}${i}`;
      rrtDefinitions[newKey] = `${desc} ${i}`;
    }
    newKey = `${key}U`;
    rrtDefinitions[newKey] = `Extension of ${key} ramp`;
  }
}

const rrqAbbreviations: { [key: string]: string } = {
  "2NDST": "2nd St.",
  "3RDAVE": "3rd Ave.",
  "6THST": "6th St.",
  ABERDN: "Aberdeen",
  ANACOR: "Anacortes",
  ANACRT: "Anacortes",
  ANAFT2: "ANAFT2",
  AURORA: "Aurora",
  BOONE: "Boone St.",
  // "BREFT2": "BREFT2",
  BREMER: "Bremerton",
  BROWNE: "Browne St.",
  BURKE: "Beverly Burke Rd.",
  CANBY: "Fort Canby",
  CEDRWY: "Cedar Way",
  CLEELM: "Cle Elem",
  // "CLIFT2": "CLIFT2",
  CLINTN: "Clifton",
  COLFAX: "Colfax",
  COUGAR: "Cougar",
  COUPLT: "COUPLT",
  COUPVL: "Coupville",
  CRWNPT: "Crown Point",
  CS0631: "CS0631",
  DIVISN: "Division",
  EAGHBR: "Eagle Harbor",
  EDMOND: "Edmonds",
  EVERET: "Everett",
  FAUNTL: "Fauntleroy",
  FIFE: "Fife",
  FRIDAY: "Friday Harbor",
  GNESSE: "GNESSE",
  GORST: "Gorst",
  HERON: "Heron St.",
  HQUIAM: "Hoquiam",
  HYAK: "Hyak Dr.",
  KELRNO: "Keller North",
  KELRSO: "Keller South",
  KELSO: "Kelso",
  KINFT1: "KINFT1",
  KINGST: "Kingston",
  KNGSTN: "Kingston",
  LEAHY: "Leahy",
  LONNGR: "LONNGR",
  LOPEZ: "Lopez",
  MARYHL: "Maryhill",
  MKLTEO: "Mukilteo",
  MONROE: "Monroe",
  MORA: "Mora Rd.",
  MTBAKR: "Mt. Baker",
  MUKILT: "Mukilteo",
  NEWPRT: "Newport",
  NSC: "NSC",
  OLD504: "Old 504",
  OMAK: "Omak",
  ORCAS: "Orcas Island",
  ORGBEG: "ORGBEG",
  ORGMID: "ORGMID",
  ORGSPR: "ORGSPR",
  ORONDO: "Orondo",
  OSO: "Oso",
  PAINE: "Paine",
  PEARL: "Pearl St.",
  PRTANG: "Port Angeles",
  PTDEFI: "Pt. Defiance",
  PTTFT2: "PTTFT2",
  PTTOWN: "Port Townsend",
  PULLMN: "Pullman",
  PURDY: "Purdy Ln.",
  REDMND: "Redmond",
  // "SEAFT2": "SEAFT2",
  // "SEAFT3": "SEAFT3",
  SEATAC: "SeaTac",
  SEATTL: "Seattle",
  SHAW: "Shaw Island",
  SIDNEY: "Sidney",
  SLVRDL: "Silverdale",
  SOUTHW: "Southworth",
  SUMAS: "Sumas",
  TAHLEQ: "Tahlequa",
  TUNNEL: "Tunnel",
  UNDRWD: "Underwood",
  VANCVR: "Vancouver",
  // "VASFT2": "VASFT2",
  VASHON: "Vashon",
  VIADCT: "Alaskan Way Viaduct",
  WALULA: "Wallula Junction",
  WENTCH: "Wenatchee",
  WESTPT: "Westport",
  // "WINFT2": "WINFT2",
  WINSLO: "Winslow",
  XBASE: "XBASE",
  YELMLP: "Yelm Loop"
};

export default class RouteId {
  /**
   * A comparison method used for sorting {@link RouteId} objects.
   * @param {RouteId} a - RouteId object to be compared
   * @param {RouteId} b - RouteId object to be compared
   * @returns {number} Returns a value indicating if a should be before b or vice-versa.
   */
  public static sort(a: RouteId, b: RouteId) {
    if (a.sr > b.sr) {
      return 1;
    } else if (a.sr < b.sr) {
      return -1;
    } else if (a.rrq !== null && b.rrq !== null) {
      if (a.rrq === b.rrq) {
        return 0;
      } else if (
        a.mainlineIntersectionMP === null &&
        b.mainlineIntersectionMP !== null
      ) {
        return -1;
      } else if (
        a.mainlineIntersectionMP !== null &&
        b.mainlineIntersectionMP === null
      ) {
        return 1;
      } else if (a.rrq > b.rrq) {
        return 1;
      } else {
        return -1;
      }
    } else {
      const sa = a.toString();
      const sb = b.toString();
      if (sa === sb) {
        return 0;
      } else if (sa > sb) {
        return 1;
      } else {
        return -1;
      }
    }
  }
  // tslint:disable-next-line:variable-name
  private _sr: string;
  public get sr(): string {
    return this._sr;
  }

  // tslint:disable-next-line:variable-name
  private _rrt: string | null;
  public get rrt(): string | null {
    return this._rrt;
  }

  // tslint:disable-next-line:variable-name
  private _rrq: string | null;
  public get rrq(): string | null {
    return this._rrq;
  }

  public get rrtDescription(): string | null {
    return this._rrt ? rrtDefinitions[this._rrt] : null;
  }

  /**
   * Description of the route ID's RRQ portion, if it exists. Null otherwise.
   */
  public get rrqDescription() {
    let output = null;
    if (this._rrq !== null) {
      if (rrqAbbreviations[this._rrq]) {
        output = rrqAbbreviations[this._rrq];
      } else {
        const n = this.mainlineIntersectionMP;
        if (n !== null) {
          output = " @ MP " + n;
        } else {
          output = this._rrq;
        }
      }
    }
    return output;
  }

  /**
   * Extended description of the route ID.
   */
  public get description(): string {
    let label;
    if (!this._rrt) {
      label = [this._sr, "Mainline"].join(" ");
    } else if (!this._rrq) {
      label = [this._sr, this.rrtDescription].join(" ");
    } else if (this.mainlineIntersectionMP !== null) {
      label = [
        this._sr,
        this.rrtDescription,
        "@ MP",
        this.mainlineIntersectionMP
      ].join(" ");
    } else {
      label = [this._sr, this.rrtDescription, this.rrqDescription].join(" ");
    }

    return label;
  }

  /**
   * The milepost on the mainline route where this route attaches.
   * Will be null if the RRQ is non-numeric.
   */
  public get mainlineIntersectionMP(): string | number | null {
    let i = null;
    const re = /^(\d+)([BCRS])?$/i;
    const match = this._rrq ? this._rrq.match(re) : null;
    if (match) {
      i = parseInt(match[1], 10);
      i = i / 100;
      if (match[2]) {
        i = [i, match[2]].join("");
      }
    }
    return i;
  }

  /**
   * Splits a state route ID into SR, RRT, RRQ components.
   * @constructor
   * @param {string} routeId - Identifier for a WA state route
   * @alias module:RouteId
   */
  constructor(routeId: string) {
    routeId = routeId.trim();
    let match;

    if (!routeId) {
      throw new TypeError("No route ID was provided.");
    }
    match = routeId.match(routeRe);

    if (!match) {
      throw new FormatError(routeId, routeRe);
    }

    this._sr = match[1];
    this._rrt = match[2] || null;
    this._rrq = match[3] || null;
  }

  /**
   * Returns a string representation of the RouteID.
   * @returns {string} - Returns the route identifier string.
   */
  public toString() {
    const output = [this.sr];
    if (this.rrt) {
      output.push(this.rrt);
      if (this.rrq) {
        output.push(this.rrq);
      }
    }
    return output.join("");
  }
}
