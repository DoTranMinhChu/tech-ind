import { IBaseIndicatorInput } from "../base-indicator";

export interface ILLVInput extends IBaseIndicatorInput<number> {
  period: number;
  values: number[];
}
