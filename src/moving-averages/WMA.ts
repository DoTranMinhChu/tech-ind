import { BaseIndicator } from "../base-indicator";
import { IMAInput } from "../types";
import { LinkedList } from "../utils/LinkedList";

export class WMA extends BaseIndicator<number> {
  period!: number;
  price!: number[];
  override result: number[];
  generator: Generator<number | undefined, number | undefined, number>;
  constructor(input: IMAInput) {
    super(input);
    const period = input.period;
    const priceArray = input.values;
    this.result = [];
    this.generator = (function* (): Generator<
      number | undefined,
      number | undefined,
      number
    > {
      let data = new LinkedList();
      let denominator = (period * (period + 1)) / 2;

      while (true) {
        if (data.length < period) {
          data.push(yield);
        } else {
          data.resetCursor();
          let result = 0;
          for (let i = 1; i <= period; i++) {
            result = result + (data.next() * i) / denominator;
          }
          const next = yield result;
          data.shift();
          data.push(next);
        }
      }
    })();

    this.generator.next();

    priceArray.forEach((tick) => {
      const result = this.generator.next(tick);
      if (result.value != undefined) {
        this.result.push(this.format(result.value));
      }
    });
  }

  static calculate = wma;

  //STEP 5. REMOVE GET RESULT FUNCTION
  nextValue(price: number): number | undefined {
    const result = this.generator.next(price).value;
    if (result != undefined) return this.format(result);
    return undefined;
  }
}

export function wma(input: IMAInput): number[] {
  BaseIndicator.reverseInputs(input);
  const result = new WMA(input).result;
  if (input.reversedInput) {
    result.reverse();
  }
  BaseIndicator.reverseInputs(input);
  return result;
}
