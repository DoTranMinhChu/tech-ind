import { IBaseIndicatorInput } from "../types";
import { NumberFormat } from "../utils/NumberFormatter";

export class BaseIndicator<TOutput> {
  // Khai báo result là một mảng của TOutput
  result: TOutput[] = [];
  format: (data: TOutput) => TOutput;

  constructor(input: IBaseIndicatorInput<TOutput>) {
    this.format = input.format || NumberFormat(1);
  }

  static reverseInputs(input: any): void {
    if (input.reversedInput) {
      input.values ? input.values.reverse() : undefined;
      input.open ? input.open.reverse() : undefined;
      input.high ? input.high.reverse() : undefined;
      input.low ? input.low.reverse() : undefined;
      input.close ? input.close.reverse() : undefined;
      input.volume ? input.volume.reverse() : undefined;
      input.timestamp ? input.timestamp.reverse() : undefined;
    }
  }

  // Khai báo kiểu trả về cho getResult là mảng các TOutput
  getResult(): TOutput[] {
    return this.result;
  }
}
