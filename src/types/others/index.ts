import { IBaseIndicatorInput } from "../base-indicator";

export interface IAvgGainInput extends IBaseIndicatorInput<number> {
  period: number;
  values: number[];
}

export interface IAvgLossInput extends IBaseIndicatorInput<number> {
  period: number;
  values: number[];
}

export interface ICrossInput extends IBaseIndicatorInput<number> {
  sourceSeries: number[];
  referenceSeries: number[];
}
export interface ICrossNext {
  sourceValue: number;
  referenceValue: number;
}
