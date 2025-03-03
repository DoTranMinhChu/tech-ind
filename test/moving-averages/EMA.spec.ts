import assert from "assert";
import { EMA } from "../../src";
import { data } from "../data";
import { NumberFormat } from "../../src/utils/NumberFormatter";

const prices = data.close;
const period = 9;
const expectedOutput = [
  { value: undefined, timestamp: 1028173500 },
  { value: undefined, timestamp: 1030938300 },
  { value: undefined, timestamp: 1033443900 },
  { value: undefined, timestamp: 1036122300 },
  { value: undefined, timestamp: 1038800700 },
  { value: undefined, timestamp: 1041392700 },
  { value: undefined, timestamp: 1044243900 },
  { value: undefined, timestamp: 1046663100 },
  { value: 138.3, timestamp: 1049168700 },
  { value: 140.5, timestamp: 1051760700 },
  { value: 144.9, timestamp: 1054525500 },
  { value: 151.7, timestamp: 1057031100 },
  { value: 161.4, timestamp: 1059709500 },
  { value: 173.5, timestamp: 1062387900 },
  { value: 187.5, timestamp: 1064979900 },
  { value: 198.7, timestamp: 1067831100 },
  { value: 216.2, timestamp: 1070250300 },
  { value: 229.0, timestamp: 1072928700 },
];
const expectedEMAOutput = expectedOutput
  .map((item) => item.value)
  .filter((value) => value != undefined);

describe("EMA (Exponential Moving Average)", function () {
  it("should calculate EMA using the calculate method", function () {
    assert.deepEqual(
      EMA.calculate({ period: period, values: prices }),
      expectedEMAOutput,
      "Wrong Results"
    );
  });

  it(`should calculate EMA ${period} for candlestick using the calculate method`, function () {
    const smaData = EMA.calculate({
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

  it("should be able to get EMA from the get results", function () {
    const emaProducer = new EMA({ period: period, values: prices });
    assert.deepEqual(
      emaProducer.getResult(),
      expectedEMAOutput,
      "Wrong Results while getting results"
    );
  });

  it("should be able to get EMA for the next bar using nextValue", function () {
    const emaProducer = new EMA({ period: period, values: [] });
    const results: number[] = [];
    prices.forEach((price) => {
      const result = emaProducer.nextValue(price);
      if (result) results.push(result);
    });
    assert.deepEqual(
      results,
      expectedEMAOutput,
      "Wrong Results while getting results"
    );
  });

  it("should be able to get EMA for the next bar using nextValue", function () {
    const results = EMA.calculate({
      period: 4,
      values: [10, 12, 14, 13, 15, 17, 16, 18, 19, 20],
      format: NumberFormat(2),
    });

    const expectedEMAOutput = [12.25, 13.35, 14.81, 15.29, 16.37, 17.42, 18.45];

    assert.deepEqual(
      results,
      expectedEMAOutput,
      "Wrong Results while getting results"
    );
  });
});
