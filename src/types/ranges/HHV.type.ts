import { IBaseIndicatorInput } from "../base-indicator";

export interface IHHVInput extends IBaseIndicatorInput<number> {
  period: number;
  values: number[];
}
