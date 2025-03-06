import { DynamicIndicatorAbstract } from "../base-indicator";
import { IMAInput } from "../types";

export class EMA extends DynamicIndicatorAbstract<number, number> {
  period!: number;
  values: number[] = [];

  override result: number[];
  generator: Generator<number | undefined, number | undefined, number>;
  constructor(input: IMAInput) {
    super(input);
    this.period = input.period;
  }
  protected createGenerator(): Generator<
    number | undefined,
    number | undefined,
    number
  > {
    const period = this.period;
    const alpha = 2 / (period + 1);

    // Ta dùng tạm một mảng hoặc một SMA để gom đủ 'period' bar đầu tiên
    let buffer: number[] = [];
    let prevEma: number | undefined = undefined;

    return (function* () {
      let tick = yield; // Lấy bar đầu tiên
      while (true) {
        if (tick !== undefined) {
          buffer.push(tick);
        }

        // Khi buffer chưa đủ 'period' bar => chưa tính EMA, yield undefined
        if (buffer.length < period) {
          tick = yield undefined;
          continue;
        }

        // Nếu prevEma còn undefined, ta khởi tạo bằng SMA của 'period' bar đầu
        if (prevEma === undefined) {
          const sum = buffer.reduce((acc, val) => acc + val, 0);
          prevEma = sum / period;
          // yield EMA đầu tiên = SMA
          tick = yield prevEma;
        } else {
          // Áp dụng công thức EMA
          if (tick !== undefined && prevEma !== undefined) {
            prevEma = prevEma + alpha * (tick - prevEma);
            tick = yield prevEma;
          } else {
            tick = yield undefined;
          }
        }
      }
    })();
  }

  public nextValue(price: number): number | undefined {
    const result = this.generator.next(price).value;
    this.values.push(price);
    if (result != undefined) return this.format(result);
    return undefined;
  }

  static calculate(input: IMAInput): number[] {
    DynamicIndicatorAbstract.reverseInputs(input);
    const emaInstance = new EMA(input);
    const result = emaInstance.result;
    if (input.reversedInput) {
      result.reverse();
    }
    DynamicIndicatorAbstract.reverseInputs(input);
    return result;
  }
}
