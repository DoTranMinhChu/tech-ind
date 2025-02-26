import { BaseIndicator } from "../base-indicator";
import { IAvgLossInput } from "../types";

export class AverageLoss extends BaseIndicator<number> {
  generator: Generator<number | undefined, number | undefined, number>;
  constructor(input: IAvgLossInput) {
    super(input);
    const values = input.values;
    const period = input.period;
    const format = this.format;

    this.generator = (function* (
      period
    ): Generator<number | undefined, number | undefined, number> {
      let currentValue = yield;
      let counter = 1;
      let lossSum = 0;
      let avgLoss: number | undefined;
      let loss;
      let lastValue = currentValue;
      currentValue = yield;
      while (true) {
        loss = lastValue - currentValue;
        loss = loss > 0 ? loss : 0;
        if (loss > 0) {
          lossSum = lossSum + loss;
        }
        if (counter < period) {
          counter++;
        } else if (avgLoss === undefined) {
          avgLoss = lossSum / period;
        } else {
          avgLoss = (avgLoss * (period - 1) + loss) / period;
        }
        lastValue = currentValue;
        avgLoss = avgLoss !== undefined ? format(avgLoss) : undefined;
        currentValue = yield avgLoss;
      }
    })(period);

    this.generator.next();

    this.result = [];

    values.forEach((tick: number) => {
      let result = this.generator.next(tick);
      if (result.value !== undefined) {
        this.result.push(result.value);
      }
    });
  }

  static calculate = averageloss;

  nextValue(price: number): number | undefined {
    return this.generator.next(price).value;
  }
}

export function averageloss(input: IAvgLossInput): number[] {
  BaseIndicator.reverseInputs(input);
  let result = new AverageLoss(input).result;
  if (input.reversedInput) {
    result.reverse();
  }
  BaseIndicator.reverseInputs(input);
  return result;
}
