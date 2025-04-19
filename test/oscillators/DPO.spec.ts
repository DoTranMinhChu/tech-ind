import { strict as assert } from "assert";
import { DPO } from "../../src";
import { IMAInput } from "../../src/types";

describe("DPO (Detrended Price Oscillator)", function () {
  // Dataset: simple increasing prices
  const prices = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
  const period = 4;
  const input: IMAInput = { period, values: prices };

  // shift = floor(period/2) + 1 = 3
  // DPO valid from index = period + shift - 1 = 4 + 3 - 1 = 6
  // For index 6: SMA of prices[0..3] = (10+12+14+16)/4 = 13 => DPO = 22 - 13 = 9
  const expected = [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    9,
    9,
    9,
    9,
  ];

  it("calculate() should return correct DPO array", function () {
    const result = DPO.calculate(input);
    assert.strictEqual(
      result.length,
      prices.length,
      "Result length must match input length"
    );
    for (let i = 0; i < prices.length; i++) {
      if (expected[i] === undefined) {
        assert.strictEqual(
          result[i],
          undefined,
          `Expected undefined at index ${i}`
        );
      } else {
        assert.strictEqual(
          result[i],
          expected[i],
          `Expected DPO[${i}] = ${expected[i]}, got ${result[i]}`
        );
      }
    }
  });

  it("getResult() should match calculate() output", function () {
    const dpo = new DPO(input);
    const result = dpo.getResult();
    assert.deepEqual(result, expected, "getResult() output mismatch");
  });

  it("nextValue() should stream values correctly", function () {
    const dpo = new DPO({ period, values: [] });
    const streamed: Array<number | undefined> = [];
    prices.forEach((price) => streamed.push(dpo.nextValue(price)));
    assert.deepEqual(streamed, expected, "nextValue() output mismatch");
  });

  it("updateBar() should recalc when a bar is updated", function () {
    const dpo = new DPO(input);
    // update price at index 6 from 22 to 30
    dpo.updateBar(6, 30);
    const result = dpo.getResult();
    // now at index 6: SMA still 13, DPO = 30 - 13 = 17
    assert.strictEqual(
      result[6],
      17,
      `After update, expected DPO[6] = 17, got ${result[6]}`
    );
    // other indices before 6 remain undefined
    for (let i = 0; i < 6; i++) {
      assert.strictEqual(
        result[i],
        undefined,
        `Expected undefined at index ${i}`
      );
    }
  });
});
