import { IBaseIndicatorInput } from "../base-indicator/base-indicator.type";

export interface IMAInput extends IBaseIndicatorInput<number> {
    period: number;
    values: number[];
}
