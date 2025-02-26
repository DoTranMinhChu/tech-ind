export interface IBaseIndicatorInput<TOutput> {
  reversedInput?: boolean;
  format?: (data: TOutput) => any;
}

export interface ISeriesInputs {
  values?: number[];
  open?: number[];
  high?: number[];
  low?: number[];
  close?: number[];
  volume?: number[];
  timestamp?: number[];
}
