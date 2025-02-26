import { BaseIndicator } from "../base-indicator";
import { IMAInput } from "../types";
import { SMA } from "./SMA";

export class WEMA extends BaseIndicator<number> {
  period!: number;
  price: number[] = [];
  override result: number[];
  generator: Generator<number | undefined, number | undefined, number>;
  constructor(input: IMAInput) {
    super(input);
    const period = input.period;
    const priceArray = input.values;
    const exponent = 1 / period;
    let sma: SMA;

    this.result = [];

    sma = new SMA({ period: period, values: [] });

    const genFn = function* (): Generator<
      number | undefined,
      number | undefined,
      number
    > {
      let tick = yield;
      let prevEma: number | undefined = undefined;
      while (true) {
        if (prevEma !== undefined && tick !== undefined) {
          prevEma = (tick - prevEma) * exponent + prevEma;
          tick = yield prevEma;
        } else {
          tick = yield;
          prevEma = sma.nextValue(tick);
          if (prevEma !== undefined) tick = yield prevEma;
        }
      }
    };

    this.generator = genFn();

    this.generator.next();
    this.generator.next();

    priceArray.forEach((tick) => {
      const result = this.generator.next(tick);
      if (result.value != undefined) {
        this.result.push(this.format(result.value));
      }
    });
  }

  static calculate = wema;

  nextValue(price: number): number | undefined {
    const result = this.generator.next(price).value;
    if (result != undefined) return this.format(result);
    return undefined;
  }
}

export function wema(input: IMAInput): number[] {
  BaseIndicator.reverseInputs(input);
  const result = new WEMA(input).result;
  if (input.reversedInput) {
    result.reverse();
  }
  BaseIndicator.reverseInputs(input);
  return result;
}
