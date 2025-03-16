import { DynamicIndicatorAbstract } from "../base-indicator";
import { IBaseIndicatorInput } from "../types";

// Định nghĩa kiểu cho nến dùng trong MFI
export interface IMFICandle {
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp?: number;
}

// Định nghĩa input cho chỉ báo MFI
export interface IMFIInput extends IBaseIndicatorInput<number> {
  period: number;
  values: IMFICandle[];
}

export class MFI extends DynamicIndicatorAbstract<IMFICandle, number> {
  period: number;
  values: IMFICandle[];

  constructor(input: IMFIInput) {
    super(input);
    this.period = input.period;
    this.values = input.values;
  }

  /**
   * Ghi đè initialize() để lưu _mọi_ kết quả, kể cả undefined,
   * nhằm đảm bảo mảng result có độ dài bằng với số nến đầu vào.
   */
  protected initialize(): void {
    this.generator = this.createGenerator();
    this.generator.next(); // prime generator
    const results: (number | undefined)[] = [];
    this.values.forEach((tick: IMFICandle) => {
      const res = this.generator.next(tick).value;
      results.push(res === undefined ? undefined : this.format(res));
    });
    this.result = results;
  }

  /**
   * Ghi đè updateBar() để cập nhật lại toàn bộ kết quả mà không loại trừ undefined.
   */
  public updateBar(index: number, newValue: IMFICandle): void {
    if (index < 0 || index >= this.values.length) {
      throw new Error("Index out of range");
    }
    this.values[index] = newValue;
    this.generator = this.createGenerator();
    this.generator.next();
    const newResults: (number | undefined)[] = [];
    for (let i = 0; i < this.values.length; i++) {
      const res = this.generator.next(this.values[i]).value;
      newResults.push(res === undefined ? undefined : this.format(res));
    }
    this.result = newResults;
  }

  /**
   * Tạo generator để tính Money Flow Index theo từng bước:
   * - Tính giá trung bình (TP = (high + low + close)/3)
   * - Tính raw money flow = TP * volume
   * - So sánh với TP của nến trước để xác định dòng tiền dương hay âm.
   * - Duy trì 2 cửa sổ trượt chứa giá trị dòng tiền dương và âm.
   * - Khi đủ period, tính tổng dòng tiền dương và âm, sau đó tính MFI.
   */
  protected createGenerator(): Generator<
    number | undefined,
    number | undefined,
    IMFICandle
  > {
    const period = this.period;
    let previousTP: number | undefined = undefined;
    const windowPos: number[] = [];
    const windowNeg: number[] = [];

    return (function* () {
      let tick = yield;
      while (true) {
        if (!tick) {
          tick = yield undefined;
          continue;
        }

        // Tính giá trung bình của nến hiện tại
        const tp = (tick.high + tick.low + tick.close) / 3;
        const rawMoneyFlow = tp * tick.volume;

        if (previousTP !== undefined) {
          if (tp > previousTP) {
            windowPos.push(rawMoneyFlow);
            windowNeg.push(0);
          } else if (tp < previousTP) {
            windowPos.push(0);
            windowNeg.push(rawMoneyFlow);
          } else {
            windowPos.push(0);
            windowNeg.push(0);
          }

          // Cắt bớt dữ liệu cũ nếu vượt quá period
          if (windowPos.length > period) {
            windowPos.shift();
            windowNeg.shift();
          }

          let result: number | undefined;
          if (windowPos.length === period) {
            const sumPos = windowPos.reduce((acc, val) => acc + val, 0);
            const sumNeg = windowNeg.reduce((acc, val) => acc + val, 0);

            if (sumNeg === 0) {
              result = sumPos > 0 ? 100 : 50;
            } else {
              const moneyFlowRatio = sumPos / sumNeg;
       
              result = 100 - 100 / (1 + moneyFlowRatio);
            }
          }

          previousTP = tp;
          tick = yield result;
        } else {
          previousTP = tp;
          tick = yield undefined;
        }
      }
    })();
  }

  /**
   * Phương thức nextValue nhận một nến và trả về MFI tương ứng (nếu đủ dữ liệu).
   */
  public nextValue(candle: IMFICandle): number | undefined {
    const result = this.generator.next(candle).value;
    this.values.push(candle);
    return result === undefined ? undefined : this.format(result);
  }

  /**
   * Phương thức tĩnh calculate cho phép tính toán MFI cho toàn bộ dãy nến.
   */
  static calculate(input: IMFIInput): number[] {
    DynamicIndicatorAbstract.reverseInputs(input);
    const mfiInstance = new MFI(input);
    const result = mfiInstance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    DynamicIndicatorAbstract.reverseInputs(input);
    return result;
  }
}
