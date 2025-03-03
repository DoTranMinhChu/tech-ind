import assert from "assert";
import { SMA } from "../../src";
import { data } from "../data";
import { NumberFormat } from "../../src/utils/NumberFormatter";

const prices = data.close;

const period = 10;

const expectedOutput = [
  { value: undefined, timestamp: 1028173500 },
  { value: undefined, timestamp: 1030938300 },
  { value: undefined, timestamp: 1033443900 },
  { value: undefined, timestamp: 1036122300 },
  { value: undefined, timestamp: 1038800700 },
  { value: undefined, timestamp: 1041392700 },
  { value: undefined, timestamp: 1044243900 },
  { value: undefined, timestamp: 1046663100 },
  { value: undefined, timestamp: 1049168700 },
  { value: 139.4, timestamp: 1051760700 },
  { value: 142.9, timestamp: 1054525500 },
  { value: 147.9, timestamp: 1057031100 },
  { value: 154.7, timestamp: 1059709500 },
  { value: 162.3, timestamp: 1062387900 },
  { value: 171.7, timestamp: 1064979900 },
  { value: 182.3, timestamp: 1067831100 },
  { value: 196.2, timestamp: 1070250300 },
  { value: 210.4, timestamp: 1072928700 },
];
const expectedSMAOutput = expectedOutput
  .map((item) => item.value)
  .filter((value) => value != undefined);

describe("SMA (Simple Moving Average)", function () {
  it("should calculate SMA using the calculate method", function () {
    const result = SMA.calculate({ period: period, values: prices });
    assert.deepEqual(result, expectedSMAOutput, "Wrong Results");
  });

  it(`should calculate SMA ${period} for candlestick using the calculate method`, function () {
    const smaData = SMA.calculate({
      period,
      values: data.candlesticks.map((item) => item.close),
    });

    const candlestickResult = data.candlesticks.map((item, index) => {
      return {
        value: index + 1 < period ? undefined : smaData[index + 1 - period],
        timestamp: item.timestamp,
      };
    });
    assert.deepEqual(candlestickResult, expectedOutput, "Wrong Results");
  });

  it("should be able to calculate EMA by using getResult", function () {
    const smaProducer = new SMA({ period: period, values: prices });
    assert.deepEqual(
      smaProducer.getResult(),
      expectedSMAOutput,
      "Wrong Results while calculating next bar"
    );
  });

  it("should be able to get SMA for the next bar using nextValue", function () {
    const smaProducer = new SMA({ period: period, values: [] });
    const results: Array<number> = [];
    prices.forEach((price) => {
      const result = smaProducer.nextValue(price);
      if (result) results.push(result);
    });
    assert.deepEqual(
      results,
      expectedSMAOutput,
      "Wrong Results while getting results"
    );
  });

  it("should be able to get SMA for the next bar using updateCurrentValue", function () {
    const smaProducer = new SMA({ period: 4, values: [] });

    [2, 6, 12, 24, 100, 52, 64].forEach((price) => {
      smaProducer.nextValue(price);
    });
    smaProducer.updateBar(4, 46);

    const results: Array<number> = smaProducer.getResult();
    assert.deepEqual(
      results,
      [11, 22, 33.5, 46.5],
      "Wrong Results while getting results"
    );
  });

  it("should be able to get SMA for low values(issue 1)", function () {
    let expectedResult = [0.002, 0.003, 0.003, 0.003, 0.003, 0.003];
    const results = SMA.calculate({
      period: 4,
      values: [0.001, 0.003, 0.001, 0.003, 0.004, 0.002, 0.003, 0.003, 0.002],
      format: NumberFormat(3),
    });;
    assert.deepEqual(results, expectedResult, "Wrong Results");
  });

  it("Passing format function should format the results appropriately", function () {
    let expectedResult = [0.002, 0.003, 0.003, 0.003, 0.003, 0.003];
    assert.deepEqual(
      SMA.calculate({
        period: 4,
        values: [0.001, 0.003, 0.001, 0.003, 0.004, 0.002, 0.003, 0.003, 0.002],
        format: NumberFormat(3),
      }),
      expectedResult,
      "Wrong Results"
    );
  });
});
