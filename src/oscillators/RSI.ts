import { DynamicIndicatorAbstract, BaseIndicator } from "../base-indicator";
import { IRSIInput } from "../types";
import { AverageGain } from "../utils/AverageGain";
import { AverageLoss } from "../utils/AverageLoss";

export class RSI extends DynamicIndicatorAbstract<number, number> {
  period: number;
  gainProvider: AverageGain;
  lossProvider: AverageLoss;

  constructor(input: IRSIInput) {
    super(input);
    this.period = input.period;
  }

  protected createGenerator(): Generator<
    number | undefined,
    number | undefined,
    number
  > {
    const gainProvider = new AverageGain({
      period: this.period,
      values: [],
      format: (v) => v,
    });
    const lossProvider = new AverageLoss({
      period: this.period,
      values: [],
      format: (v) => v,
    });
    return (function* (): Generator<
      number | undefined,
      number | undefined,
      number
    > {
      let current = yield;
      let currentRSI: number | undefined;
      while (true) {
        const avgGain = gainProvider.nextValue(current);
        const avgLoss = lossProvider.nextValue(current);
        if (avgGain !== undefined && avgLoss !== undefined) {
          if (avgLoss === 0) {
            currentRSI = 100;
          } else if (avgGain === 0) {
            currentRSI = 0;
          } else {
            let RS = avgGain / avgLoss;
            RS = isNaN(RS) ? 0 : RS;
            currentRSI = parseFloat((100 - 100 / (1 + RS)).toFixed(2));
          }
        }
        current = yield currentRSI;
      }
    })();
  }

  public nextValue(price: number): number | undefined {
    const result = this.generator.next(price).value;
    this.values.push(price);
    if (result !== undefined) return this.format(result);
    return undefined;
  }

  static calculate(input: IRSIInput): number[] {
    BaseIndicator.reverseInputs(input);
    const instance = new RSI(input);
    const result = instance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    BaseIndicator.reverseInputs(input);
    return result;
  }
}
