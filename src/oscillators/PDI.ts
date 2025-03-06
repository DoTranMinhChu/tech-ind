// PDI.ts
import { DynamicIndicatorAbstract } from "../base-indicator";
import { BaseIndicator } from "../base-indicator";
import { IPDICandle, IPDIInput } from "../types";

/**
 * PDI tính toán Plus Directional Movement Indicator dựa trên Wilder smoothing.
 * Công thức:
 *   - rawPlusDM = (currentHigh - previousHigh > previousLow - currentLow && currentHigh - previousHigh > 0)
 *                  ? (currentHigh - previousHigh) : 0
 *   - rawTR = max( currentHigh - currentLow, |currentHigh - previousClose|, |currentLow - previousClose| )
 * Với giai đoạn ban đầu, tích lũy (period – 1) giá trị raw; sau đó tại nến thứ period, khởi tạo giá trị làm mượt,
 * và với các nến sau áp dụng Wilder smoothing:
 *   smoothedPlusDM = previousSmoothedPlusDM - (previousSmoothedPlusDM / period) + rawPlusDM
 *   smoothedATR    = previousSmoothedATR - (previousSmoothedATR / period) + rawTR
 *   PDI = (smoothedPlusDM / smoothedATR) * 100 (nếu smoothedATR khác 0)
 */
export class PDI extends DynamicIndicatorAbstract<IPDICandle, number> {
  period: number;

  constructor(input: IPDIInput) {
    super(input);
    this.period = input.period;
  }

  /**
   * Generator tính toán PDI theo từng nến.
   * - Với (period – 1) nến đầu tiên, tích lũy raw +DM và TR, yield undefined.
   * - Ở nến thứ period, tích lũy giá trị hiện tại, khởi tạo làm mượt và yield giá trị DI đầu tiên.
   * - Sau đó, áp dụng Wilder smoothing cho các nến tiếp theo.
   */
  protected createGenerator(): Generator<
    number | undefined,
    number | undefined,
    IPDICandle
  > {
    const period = this.period;
    let prevTick: IPDICandle | null = null;
    let count = 0;
    let sumPlusDM = 0;
    let sumTR = 0;
    let initialized = false;
    let smoothedPlusDM = 0;
    let smoothedATR = 0;

    return (function* (): Generator<
      number | undefined,
      number | undefined,
      IPDICandle
    > {
      let tick = yield;
      while (true) {
        // Nếu chưa có nến trước, lưu và yield undefined.
        if (!prevTick) {
          prevTick = tick;
          tick = yield undefined;
          continue;
        }

        // Tính toán raw PlusDM: so sánh upMove và downMove.
        const upMove = tick.high - prevTick.high;
        const downMove = prevTick.low - tick.low;
        const rawPlusDM = upMove > downMove && upMove > 0 ? upMove : 0;

        // Tính toán True Range (rawTR)
        const rawTR = Math.max(
          tick.high - tick.low,
          Math.abs(tick.high - prevTick.close),
          Math.abs(tick.low - prevTick.close)
        );

        // Tích lũy các giá trị cho (period - 1) nến đầu tiên.
        if (count < period - 1) {
          sumPlusDM += rawPlusDM;
          sumTR += rawTR;
          count++;
          prevTick = tick;
          tick = yield undefined;
          continue;
        } else if (!initialized) {
          // Ở nến thứ period, tích lũy giá trị hiện tại để khởi tạo làm mượt.
          sumPlusDM += rawPlusDM;
          sumTR += rawTR;
          count++;
          smoothedPlusDM = sumPlusDM;
          smoothedATR = sumTR;
          initialized = true;
          const di =
            smoothedATR === 0 ? 0 : (smoothedPlusDM / smoothedATR) * 100;
          prevTick = tick;
          tick = yield di;
          continue;
        } else {
          // Với các nến sau, áp dụng Wilder smoothing.
          smoothedPlusDM = smoothedPlusDM - smoothedPlusDM / period + rawPlusDM;
          smoothedATR = smoothedATR - smoothedATR / period + rawTR;
          const di =
            smoothedATR === 0 ? 0 : (smoothedPlusDM / smoothedATR) * 100;
          prevTick = tick;
          tick = yield di;
        }
      }
    })();
  }

  /**
   * nextValue: cập nhật một nến mới (dữ liệu streaming) và trả về giá trị PDI đã được định dạng.
   */
  public nextValue(candle: IPDICandle): number | undefined {
    const result = this.generator.next(candle).value;
    this.values.push(candle);
    if (result !== undefined) return this.format(result);
    return undefined;
  }

  /**
   * Phương thức tĩnh calculate: tính toán PDI cho toàn bộ mảng nến được cung cấp.
   */
  static calculate(input: IPDIInput): number[] {
    BaseIndicator.reverseInputs(input);
    const instance = new PDI(input);
    const result = instance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    BaseIndicator.reverseInputs(input);
    return result;
  }
}
