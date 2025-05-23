import { DynamicIndicatorAbstract } from "../base-indicator";
import { IPDICandle, IPDIInput } from "../types";

export class PDI extends DynamicIndicatorAbstract<IPDICandle, number> {
  period: number;

  constructor(input: IPDIInput) {
    super(input);
    this.period = input.period;
  }

  protected createGenerator(): Generator<
    number | undefined,
    number | undefined,
    IPDICandle
  > {
    const period = this.period;
    let prevTick: IPDICandle | null = null;
    let smoothedPlusDM = 0;
    let smoothedATR = 0;
    let initialized = false;

    return (function* (): Generator<
      number | undefined,
      number | undefined,
      IPDICandle
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
        const rawPlusDM = upMove > downMove && upMove > 0 ? upMove : 0;
        const rawTR = Math.max(
          tick.high - tick.low,
          Math.abs(tick.high - prevTick.close),
          Math.abs(tick.low - prevTick.close)
        );

        if (!initialized) {
          // Dùng giá trị của nến đầu tiên làm khởi tạo
          smoothedPlusDM = rawPlusDM;
          smoothedATR = rawTR;
          initialized = true;
        } else {
          smoothedPlusDM = smoothedPlusDM - smoothedPlusDM / period + rawPlusDM;
          smoothedATR = smoothedATR - smoothedATR / period + rawTR;
        }

        const plusDI =
          smoothedATR === 0 ? 0 : (smoothedPlusDM / smoothedATR) * 100;
        prevTick = tick;
        tick = yield plusDI;
      }
    })();
  }

  public nextValue(candle: IPDICandle): number | undefined {
    const result = this.generator.next(candle).value;
    this.values.push(candle);
    return result !== undefined ? this.format(result) : undefined;
  }

  static calculate(input: IPDIInput): number[] {
    DynamicIndicatorAbstract.reverseInputs(input);
    const instance = new PDI(input);
    const result = instance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    DynamicIndicatorAbstract.reverseInputs(input);
    return result;
  }
}
