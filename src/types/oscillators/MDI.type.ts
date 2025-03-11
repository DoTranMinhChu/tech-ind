import { IBaseIndicatorInput } from "../base-indicator";

// Kiểu dữ liệu Candle cơ bản cho CCI
export interface IMDICandle {
  high: number;
  low: number;
  close: number;
}

export interface IMDIInput extends IBaseIndicatorInput<number> {
  values: IMDICandle[]; // An array of candlestick objects (each representing a bar of market data)
  period: number; // The period over which the indicator is calculated (e.g., 14)
  format?: (value: number) => number; // Optional function to format the output (e.g., rounding)
}
