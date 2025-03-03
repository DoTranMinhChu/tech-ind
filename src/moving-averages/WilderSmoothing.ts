import { DynamicIndicatorAbstract, BaseIndicator } from "../base-indicator";
import { IMAInput } from "../types";

export class WilderSmoothing extends DynamicIndicatorAbstract<number, number> {
  period: number;

  constructor(input: IMAInput) {
    super(input);
    this.period = input.period;
  }

  // Tạo generator chứa logic Wilder Smoothing
  protected createGenerator(): Generator<
    number | undefined,
    number | undefined,
    number
  > {
    const period = this.period;
    return (function* (): Generator<
      number | undefined,
      number | undefined,
      number
    > {
      let sum = 0;
      let counter = 1;
      let current = yield;
      let result: number | undefined = undefined;
      while (true) {
        if (counter < period) {
          counter++;
          if (current !== undefined) sum += current;
          result = undefined;
        } else if (counter === period) {
          counter++;
          if (current !== undefined) sum += current;
          result = sum;
        } else {
          if (current !== undefined && result !== undefined) {
            result = result - result / period + current;
          }
        }
        current = yield result;
      }
    })();
  }

  // Tính giá trị cho bar mới (dùng trong streaming)
  public nextValue(price: number): number | undefined {
    const result = this.generator.next(price).value;
    this.values.push(price);
    if (result !== undefined) return this.format(result);
    return undefined;
  }

  // Hàm tính toán dựa trên toàn bộ input (dùng cho backtest)
  static calculate(input: IMAInput): number[] {
    BaseIndicator.reverseInputs(input);
    const instance = new WilderSmoothing(input);
    const result = instance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    BaseIndicator.reverseInputs(input);
    return result;
  }
}
