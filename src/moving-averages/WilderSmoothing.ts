import { BaseIndicator } from "../base-indicator";
import { IMAInput } from "../types";

//STEP3. Add class based syntax with export
export class WilderSmoothing extends BaseIndicator<number> {
  period: number;
  price: number[];
  override result: number[];
  generator: Generator<number | undefined, number | undefined, number>;
  constructor(input: IMAInput) {
    super(input);
    this.period = input.period;
    this.price = input.values;
    var genFn = function* (
      period: number
    ): Generator<number | undefined, number | undefined, number> {
      let sum = 0;
      let counter = 1;
      let current = yield;
      let result: number | undefined = undefined;
      while (true) {
        if (counter < period) {
          counter++;
          current ? (sum = sum + current) : undefined;
          result = undefined;
        } else if (counter == period) {
          counter++;
          current ? (sum = sum + current) : undefined;
          result = sum;
        } else {
          current && result != undefined
            ? (result = result - result / period + current)
            : undefined;
        }
        current = yield result;
      }
    };
    this.generator = genFn(this.period);
    this.generator.next();
    this.result = [];
    this.price.forEach((tick) => {
      var result = this.generator.next(tick);
      if (result.value != undefined) {
        this.result.push(this.format(result.value));
      }
    });
  }

  static calculate = wildersmoothing;

  nextValue(price: number): number | undefined {
    var result = this.generator.next(price).value;
    if (result != undefined) return this.format(result);
    return undefined;
  }
}

export function wildersmoothing(input: IMAInput): number[] {
  BaseIndicator.reverseInputs(input);
  var result = new WilderSmoothing(input).result;
  if (input.reversedInput) {
    result.reverse();
  }
  BaseIndicator.reverseInputs(input);
  return result;
}

//STEP 6. Run the tests
