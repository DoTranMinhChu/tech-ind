import assert from "assert";
import { RSI } from "../../src";
import { data } from "../data";
import { IRSIInput } from "../../src/types";
import { NumberFormat } from "../../src/utils/NumberFormatter";

var inputRSI: IRSIInput = {
  values: data.close,
  period: 14,
  format: NumberFormat(2),
};

describe("RSI (Exponential Moving Average)", function () {
  it("should calculate RSI using the calculate method", function () {
    const RSIResult = RSI.calculate(inputRSI);
    assert.deepEqual(RSIResult, [86.39, 86.41, 89.65, 86.47], "Wrong Results");
  });
});
