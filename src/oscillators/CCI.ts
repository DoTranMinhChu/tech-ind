// CCI.ts

import { BaseIndicator, DynamicIndicatorAbstract } from "../base-indicator";
import { ICCICandle, ICCIInput } from "../types";

export class CCI extends DynamicIndicatorAbstract<ICCICandle, number> {
  period: number;
  constant: number;

  constructor(input: ICCIInput) {
    // Chuyển input.candles thành input.values cho DynamicIndicatorAbstract

    super(input);
    this.period = input.period;
    // Nếu không có constant thì dùng mặc định 0.015
    this.constant = input.constant ?? 0.015;
  }

  protected createGenerator(): Generator<
    number | undefined,
    number | undefined,
    ICCICandle
  > {
    const period = this.period;
    const constant = this.constant ?? 0.15;
    // Sử dụng mảng làm hàng đợi để lưu trữ các giá trị Typical Price (TP)
    const queue: number[] = [];
    let sumTP = 0; // Giữ tổng TP trong cửa sổ period để tính SMA nhanh

    return (function* (): Generator<
      number | undefined,
      number | undefined,
      ICCICandle
    > {
      let tick = yield;
      while (true) {
        // Tính Typical Price (TP) = (high + low + close) / 3
        const tp = (tick.high + tick.low + tick.close) / 3;

        queue.push(tp);
        sumTP += tp;

        // Nếu số phần tử vượt quá period, loại bỏ phần tử cũ nhất
        if (queue.length > period) {
          const removed = queue.shift()!;
          sumTP -= removed;
        }

        // Nếu chưa đủ period, yield undefined
        if (queue.length < period) {
          tick = yield undefined;
          continue;
        }

        // Tính SMA của TP
        const smaTP = sumTP / period;

        // Tính Mean Deviation = trung bình các |TP - smaTP|
        let sumDeviation = 0;
        for (const val of queue) {
          sumDeviation += Math.abs(val - smaTP);
        }
        const meanDeviation = sumDeviation / period;

        // Tránh chia cho 0: nếu meanDeviation bằng 0, gán CCI = 0 (hoặc theo logic khác)
        let cci: number;
        if (meanDeviation === 0) {
          cci = 0;
        } else {
          cci = (tp - smaTP) / (constant * meanDeviation);
        }

        tick = yield cci;
      }
    })();
  }

  public nextValue(candle: ICCICandle): number | undefined {
    const result = this.generator.next(candle).value;
    this.values.push(candle);
    if (result !== undefined) {
      return this.format(result);
    }
    return undefined;
  }

  static calculate(input: ICCIInput): number[] {
    BaseIndicator.reverseInputs(input);
    const instance = new CCI(input);
    const result = instance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    BaseIndicator.reverseInputs(input);
    return result;
  }
}
