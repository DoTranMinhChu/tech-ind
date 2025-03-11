import { DynamicIndicatorAbstract } from "../base-indicator";
import { IMDICandle, IMDIInput } from "../types";

export class MDI extends DynamicIndicatorAbstract<IMDICandle, number> {
  period: number;

  constructor(input: IMDIInput) {
    super(input);
    this.period = input.period;
  }

  protected createGenerator(): Generator<
    number | undefined,
    number | undefined,
    IMDICandle
  > {
    const period = this.period;
    let prevTick: IMDICandle | null = null;
    let smoothedMinusDM = 0;
    let smoothedATR = 0;
    let initialized = false;

    return (function* (): Generator<
      number | undefined,
      number | undefined,
      IMDICandle
    > {
      let tick = yield;
      while (true) {
        if (!prevTick) {
          prevTick = tick;
          tick = yield undefined;
          continue;
        }

        const upMove = tick.high - prevTick.high;
        const downMove = prevTick.low - tick.low;
        const rawMinusDM = downMove > upMove && downMove > 0 ? downMove : 0;
        const rawTR = Math.max(
          tick.high - tick.low,
          Math.abs(tick.high - prevTick.close),
          Math.abs(tick.low - prevTick.close)
        );

        if (!initialized) {
          smoothedMinusDM = rawMinusDM;
          smoothedATR = rawTR;
          initialized = true;
        } else {
          smoothedMinusDM =
            smoothedMinusDM - smoothedMinusDM / period + rawMinusDM;
          smoothedATR = smoothedATR - smoothedATR / period + rawTR;
        }

        const minusDI =
          smoothedATR === 0 ? 0 : (smoothedMinusDM / smoothedATR) * 100;
        prevTick = tick;
        tick = yield minusDI;
      }
    })();
  }

  public nextValue(candle: IMDICandle): number | undefined {
    const result = this.generator.next(candle).value;
    this.values.push(candle);
    return result !== undefined ? this.format(result) : undefined;
  }

  static calculate(input: IMDIInput): number[] {
    DynamicIndicatorAbstract.reverseInputs(input);
    const instance = new MDI(input);
    const result = instance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    DynamicIndicatorAbstract.reverseInputs(input);
    return result;
  }
}
