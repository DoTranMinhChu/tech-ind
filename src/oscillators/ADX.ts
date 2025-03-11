import { DynamicIndicatorAbstract } from "../base-indicator";
import { IPDICandle, IPDIInput } from "../types";
import { PDI } from "./PDI";
import { MDI } from "./MDI";

export class ADX extends DynamicIndicatorAbstract<IPDICandle, number> {
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
    // Khởi tạo các instance PDI và MDI với dữ liệu rỗng (sẽ được cập nhật qua streaming)
    let pdiInstance = new PDI({ period, values: [], format: (v) => v });
    let mdiInstance = new MDI({ period, values: [] ,format: (v) => v });
    let dxSum = 0;
    let dxCount = 0;
    let smoothedDX = 0;
    let adxInitialized = false;

    return (function* (): Generator<
      number | undefined,
      number | undefined,
      IPDICandle
    > {
      let tick = yield;
      while (true) {
        // Lấy giá trị gốc (raw value) từ generator của PDI và MDI để tránh làm tròn sớm
        const plusDI = pdiInstance.generator.next(tick).value;
        const minusDI = mdiInstance.generator.next(tick).value;

        if (plusDI !== undefined && minusDI !== undefined) {
          const dx =
            plusDI + minusDI === 0
              ? 0
              : (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100;
          if (dxCount < period) {
            dxSum += dx;
            dxCount++;
            tick = yield undefined;
          } else if (!adxInitialized) {
            smoothedDX = dxSum / period;
            adxInitialized = true;
            tick = yield smoothedDX;
          } else {
            smoothedDX = (smoothedDX * (period - 1) + dx) / period;
            tick = yield smoothedDX;
          }
        } else {
          tick = yield undefined;
        }
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
    const instance = new ADX(input);
    const result = instance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    DynamicIndicatorAbstract.reverseInputs(input);
    return result;
  }
}
