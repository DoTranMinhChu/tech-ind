import { IBaseIndicatorInput } from "../types";
import { BaseIndicator } from "./base-indicator";

export abstract class DynamicIndicatorAbstract<
  TInput,
  TOutput
> extends BaseIndicator<TOutput> {
  period: number;
  values: TInput[];
  result: TOutput[];
  generator: Generator<TOutput | undefined, TOutput | undefined, TInput>;

  constructor(
    input: IBaseIndicatorInput<TOutput> & { values: TInput[]; period: number }
  ) {
    super(input);
    this.values = input.values;
    this.period = input.period;
    // Object.assign(this, input);
    this.result = [];
    this.initialize();
  }

  protected initialize(): void {
    // Tạo generator chứa toàn bộ logic tính toán
    this.generator = this.createGenerator();
    this.generator.next(); // Prime generator
    const results: TOutput[] = [];
    this.values.forEach((tick: TInput) => {
      const res = this.generator.next(tick).value;
      if (res !== undefined) {
        results.push(this.format(res));
      }
    });
    this.result = results;
  }

  // Phương thức cập nhật một bar bất kỳ:
  public updateBar(index: number, newValue: TInput): void {
    if (index < 0 || index >= this.values.length) {
      throw new Error("Index out of range");
    }
    // Cập nhật giá trị mới vào mảng dữ liệu
    this.values[index] = newValue;
    // Tái tạo lại generator và tính toán lại từ đầu
    this.generator = this.createGenerator();
    this.generator.next();
    const newResults: TOutput[] = [];
    for (let i = 0; i < this.values.length; i++) {
      const res = this.generator.next(this.values[i]).value;
      if (res !== undefined) {
        newResults.push(res);
      }
    }
    this.result = newResults;
  }

  // Mỗi chỉ báo "dynamic" tự định nghĩa logic trong hàm này
  protected abstract createGenerator(): Generator<
    TOutput | undefined,
    TOutput | undefined,
    TInput
  >;

  // Hàm nextValue để tính giá trị cho bar mới (sử dụng trong streaming)
  public abstract nextValue(value: TInput): TOutput | undefined;
}
