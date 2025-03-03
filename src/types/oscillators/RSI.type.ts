import { IBaseIndicatorInput } from "../base-indicator/base-indicator.type";
export interface IRSIInput extends IBaseIndicatorInput<number> {
  period: number;
  values: number[];
}
