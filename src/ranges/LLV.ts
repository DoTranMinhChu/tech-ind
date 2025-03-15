import { DynamicIndicatorAbstract } from "../base-indicator";
import { ILLVInput } from "../types";

export class LLV extends DynamicIndicatorAbstract<number, number> {
  period: number;

  constructor(input: ILLVInput) {
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
        // Tính giá trị thấp nhất hiện thời trên toàn bộ buffer
        const currentLLV = Math.min(...buffer);
        tick = yield currentLLV;
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

  static calculate(input: ILLVInput): number[] {
    DynamicIndicatorAbstract.reverseInputs(input);
    const llvInstance = new LLV(input);
    const result = llvInstance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    DynamicIndicatorAbstract.reverseInputs(input);
    return result;
  }
}
