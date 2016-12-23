/**
 * An object containing values used to initialize the RouteLocation's properties.
 * Properties of this object correspond to those of the {@link RouteLocation} class.
 */
export interface RouteLocationInterface {
  Id?: number | null
  Route?: string | null
  Decrease?: boolean | null
  Arm?: number | null
  Srmp?: number | null
  Back?: boolean | null
  ReferenceDate?: Date | string | null
  ResponseDate?: Date | string | null
  EndArm?: number | null
  EndSrmp?: number | null
  EndBack?: boolean | null
  EndReferenceDate?: Date | string | null
  EndResponseDate?: Date | string | null
  RealignmentDate?: Date | string | null
  EndRealignmentDate?: Date | string | null
  ArmCalcReturnCode?: number | null
  ArmCalcEndReturnCode?: number | null
  ArmCalcReturnMessage?: string | null
  ArmCalcEndReturnMessage?: string | null
  LocatingError?: string | null
  RouteGeometry?: any | null
  EventPoint?: any | null
  Distance?: number | null
  Angle?: number | null
}

/**
 * A class representing either a point or a segement on a WSDOT State Route.
 */
export default class RouteLocation implements RouteLocationInterface {
  Id: number | null
  Route: string | null
  Decrease: boolean | null
  Arm: number | null
  Srmp: number | null
  Back: boolean | null
  ReferenceDate: Date | null
  ResponseDate: Date | null
  EndArm: number | null
  EndSrmp: number | null
  EndBack: boolean | null
  EndReferenceDate: Date | null
  EndResponseDate: Date | null
  RealignmentDate: Date | null
  EndRealignmentDate: Date | null
  ArmCalcReturnCode: number | null
  ArmCalcEndReturnCode: number | null
  ArmCalcReturnMessage: string | null
  ArmCalcEndReturnMessage: string | null
  LocatingError: string | null
  RouteGeometry: any | null
  EventPoint: any | null
  Distance: number | null
  Angle: number | null
  constructor(json: RouteLocationInterface)
  isLine(): boolean
  toJSON(): RouteLocationInterface
}