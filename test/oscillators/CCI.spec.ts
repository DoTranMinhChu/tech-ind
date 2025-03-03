import assert from "assert";
import { CCI } from "../../src";
import { ICCIInput } from "../../src/types";

const inputCCI: ICCIInput = {
  period: 20,
  values: [
    { high: 24.2, low: 23.85, close: 23.89 },
    { high: 24.07, low: 23.72, close: 23.95 },
    { high: 24.04, low: 23.64, close: 23.67 },
    { high: 23.87, low: 23.37, close: 23.78 },
    { high: 23.67, low: 23.46, close: 23.5 },
    { high: 23.59, low: 23.18, close: 23.32 },
    { high: 23.8, low: 23.4, close: 23.75 },
    { high: 23.8, low: 23.57, close: 23.79 },
    { high: 24.3, low: 24.05, close: 24.14 },
    { high: 24.15, low: 23.77, close: 23.81 },
    { high: 24.05, low: 23.6, close: 23.78 },
    { high: 24.06, low: 23.84, close: 23.86 },
    { high: 23.88, low: 23.64, close: 23.7 },
    { high: 25.14, low: 23.94, close: 24.96 },
    { high: 25.2, low: 24.74, close: 24.88 },
    { high: 25.07, low: 24.77, close: 24.96 },
    { high: 25.22, low: 24.9, close: 25.18 },
    { high: 25.37, low: 24.93, close: 25.07 },
    { high: 25.36, low: 24.96, close: 25.27 },
    { high: 25.26, low: 24.93, close: 25.0 },
    { high: 24.82, low: 24.21, close: 24.46 },
    { high: 24.44, low: 24.21, close: 24.28 },
    { high: 24.65, low: 24.43, close: 24.62 },
    { high: 24.84, low: 24.44, close: 24.58 },
    { high: 24.75, low: 24.2, close: 24.53 },
    { high: 24.51, low: 24.25, close: 24.35 },
    { high: 24.68, low: 24.21, close: 24.34 },
    { high: 24.67, low: 24.15, close: 24.23 },
    { high: 23.84, low: 23.63, close: 23.76 },
    { high: 24.3, low: 23.76, close: 24.2 },
  ],
};

var expectedResult = [
  10.2, 3.1, 0.6, 3.3, 3.5, 1.4, -1.1, -1.2, -2.9, -13, -7.3,
];

describe("CCI (Commodity Channel Index", function () {
  it("should calculate CCI using the calculate method", function () {
    assert.deepEqual(CCI.calculate(inputCCI), expectedResult, "Wrong Results");
  });

  it("should be able to get CCI for the next bar", function () {
    var cci = new CCI(inputCCI);
    assert.deepEqual(
      cci.getResult(),
      expectedResult,
      "Wrong Results while getting results"
    );
  });

  it("should be able to get CCI for the next bar using nextValue", function () {
    var cci = new CCI({
      values: [],
      period: 20,
    });

    var results: any = [];

    inputCCI.values.forEach((value) => {
      var result = cci.nextValue(value);
      if (result != undefined) {
        results.push(result);
      }
    });
    assert.deepEqual(
      results,
      expectedResult,
      "Wrong Results while getting results"
    );
  });
});
