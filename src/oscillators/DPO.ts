import { DynamicIndicatorAbstract } from "../base-indicator";
import { IMAInput } from "../types";

export class DPO extends DynamicIndicatorAbstract<number, number> {
  period: number;
  shift: number;
  values: number[];

  constructor(input: IMAInput) {
    super(input);
    this.period = input.period;
    this.values = input.values;
    // shift = floor(period / 2) + 1
    this.shift = Math.floor(input.period / 2) + 1;
    // vì ta override initialize, phải gọi lại để sinh kết quả đầy đủ
    this.initialize();
  }

  /**
   * Ghi đè initialize() để lưu _mọi_ kết quả, kể cả undefined,
   * đảm bảo result.length === values.length
   */
  protected initialize(): void {
    this.generator = this.createGenerator();
    this.generator.next(); // prime
    const results: (number | undefined)[] = [];
    for (const price of this.values) {
      const r = this.generator.next(price).value;
      results.push(r === undefined ? undefined : this.format(r));
    }
    this.result = results as number[];
  }

  /**
   * Ghi đè updateBar để tái tạo lại toàn bộ kết quả
   */
  public updateBar(index: number, newValue: number): void {
    if (index < 0 || index >= this.values.length) {
      throw new Error("Index out of range");
    }
    this.values[index] = newValue;
    this.initialize();
  }

  /**
   * Generator sinh DPO theo từng bước:
   * - Phân tích price hiện tại
   * - Khi buffer có đủ (period + shift) giá, tính SMA của period giá ở vị trí t-shift
   * - DPO = price(t) - that_SMA
   */
  protected createGenerator(): Generator<
    number | undefined,
    number | undefined,
    number
  > {
    const period = this.period;
    const shift = this.shift;
    const buffer: number[] = [];

    return (function* () {
      let tick = yield;
      while (true) {
        if (tick !== undefined) {
          buffer.push(tick);
        }

        let result: number | undefined;
        // chỉ khi đủ dữ liệu mới tính được DPO
        if (buffer.length >= period + shift) {
          // vị trí bắt đầu của cửa sổ SMA: buffer.length - shift - period
          const start = buffer.length - shift - period;
          const slice = buffer.slice(start, start + period);
          const sum = slice.reduce((acc, v) => acc + v, 0);
          const sma = sum / period;
          result = tick! - sma;
        }

        tick = yield result;
      }
    })();
  }

  /**
   * Tính DPO cho bar mới
   */
  public nextValue(price: number): number | undefined {
    const r = this.generator.next(price).value;
    this.values.push(price);
    return r === undefined ? undefined : this.format(r);
  }

  /**
   * Tĩnh: tính cho toàn bộ mảng giá
   */
  static calculate(input: IMAInput): number[] {
    DynamicIndicatorAbstract.reverseInputs(input);
    const dpo = new DPO(input);
    const res = dpo.result;
    if (input.reversedInput) {
      res.reverse();
    }
    DynamicIndicatorAbstract.reverseInputs(input);
    return res;
  }
}
