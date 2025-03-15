import { DynamicIndicatorAbstract } from "../base-indicator";
import { IMAInput } from "../types";

export class HHV extends DynamicIndicatorAbstract<number, number> {
  period: number;

  constructor(input: IMAInput) {
    super(input);
    this.period = input.period;
  }

  protected createGenerator(): Generator<number | undefined, number | undefined, number> {
    const period = this.period;
    const buffer: number[] = [];
    return (function* () {
      let tick = yield;
      while (true) {
        if (tick !== undefined) {
          buffer.push(tick);
        }
        // Tính giá trị cao nhất hiện thời trên toàn bộ buffer
        const currentHHV = Math.max(...buffer);
        tick = yield currentHHV;
        // Giữ kích thước buffer không vượt quá period
        if (buffer.length >= period) {
          buffer.shift();
        }
      }
    })();
  }

  public nextValue(price: number): number | undefined {
    const result = this.generator.next(price).value;
    this.values.push(price);
    if (result !== undefined) return this.format(result);
    return undefined;
  }

  static calculate(input: IMAInput): number[] {
    DynamicIndicatorAbstract.reverseInputs(input);
    const hhvInstance = new HHV(input);
    const result = hhvInstance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    DynamicIndicatorAbstract.reverseInputs(input);
    return result;
  }
}
