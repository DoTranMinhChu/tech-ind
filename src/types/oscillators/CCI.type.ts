import { IBaseIndicatorInput } from "../base-indicator";

// Kiểu dữ liệu Candle cơ bản cho CCI
export interface ICCICandle {
  high: number;
  low: number;
  close: number;
}

export interface ICCIInput extends IBaseIndicatorInput<number> {
  period: number;
  constant?: number; // Mặc định 0.015
  values: ICCICandle[]; // Mảng Candle
}
