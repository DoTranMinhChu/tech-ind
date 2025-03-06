// PDI.spec.ts
import assert from "assert";
import { PDI } from "../../src";
import { NumberFormat } from "../../src/utils/NumberFormatter";

// Định nghĩa kiểu ICCICandle (nếu chưa có trong test)
interface ICCICandle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp: number;
}

/*
  Dữ liệu mẫu cho test với period = 4.
  Với dữ liệu này, test mong đợi:
    - Với calculate method: kết quả là [46.2, 43.1]
    - Với candlestick: map như sau:
        index 0-2: undefined, index 3: 46.2, index 4: 43.1, index 5: undefined.
*/
const sampleCandles: ICCICandle[] = [
  { open: 10, high: 10, low: 10, close: 10, timestamp: 1 },
  { open: 10, high: 12, low: 9, close: 11, timestamp: 2 },
  { open: 11, high: 13, low: 10, close: 12, timestamp: 3 },
  { open: 12, high: 15, low: 11, close: 14, timestamp: 4 },
  { open: 14, high: 16, low: 13, close: 15, timestamp: 5 },
  { open: 15, high: 17, low: 14, close: 16, timestamp: 6 },
];

const eDtedPlusDIOutput = [46.2, 43.1];

const expectedCandlestickOutput = sampleCandles.map((candle, index) => ({
  value: index < 3 ? undefined : eDtedPlusDIOutput[index - 3],
  timestamp: candle.timestamp,
}));

/*
  Dữ liệu cho test updateBar với period = 3.
  Với dữ liệu này, giả sử:
    - Ban đầu: các kết quả (cho bar4 và bar5) là [50.0, 44.8] (theo cách tính hiện tại của bạn)
    - Sau khi cập nhật bar4, kết quả mong đợi là [44.4, 51.9].
    (Lưu ý: Đây chỉ là ví dụ, bạn có thể điều chỉnh expected value theo công thức cụ thể)
*/
const updateCandles: ICCICandle[] = [
  { open: 10, high: 10, low: 10, close: 10, timestamp: 1000 },
  { open: 10, high: 12, low: 9, close: 11, timestamp: 2000 },
  { open: 11, high: 13, low: 10, close: 12, timestamp: 3000 },
  { open: 12, high: 15, low: 11, close: 14, timestamp: 4000 },
  { open: 14, high: 16, low: 13, close: 15, timestamp: 5000 },
];
const expectedUpdateOriginal = [50.0, 44.8];
const updatedBar4: ICCICandle = {
  open: 12,
  high: 14,
  low: 11,
  close: 13,
  timestamp: 4000,
};
const expectedUpdateNew = [44.4, 51.9];

describe("PDI (Plus Directional Movement Indicator)", function () {
  it("should calculate PDI using the calculate method", function () {
    const result = PDI.calculate({
      period: 4,
      values: sampleCandles,
      format: NumberFormat(1),
    });
    assert.deepStrictEqual(
      result,
      eDtedPlusDIOutput,
      "Wrong Results in calculate method"
    );
  });

  it("should calculate PDI for candlestick using the calculate method", function () {
    const pDIData = PDI.calculate({
      period: 4,
      values: sampleCandles,
      format: NumberFormat(1),
    });
    const candlestickResult = sampleCandles.map((candle, index) => ({
      value: index < 3 ? undefined : pDIData[index - 3],
      timestamp: candle.timestamp,
    }));
    assert.deepStrictEqual(
      candlestickResult,
      expectedCandlestickOutput,
      "Wrong candlestick results"
    );
  });

  it("should be able to calculate PDI using getResult", function () {
    const pDIProducer = new PDI({
      period: 4,
      values: sampleCandles,
      format: NumberFormat(1),
    });
    assert.deepStrictEqual(
      pDIProducer.getResult(),
      eDtedPlusDIOutput,
      "Wrong Results while using getResult"
    );
  });

  it("should be able to get PDI for the next bar using nextValue", function () {
    const pDIProducer = new PDI({
      period: 4,
      values: [],
      format: NumberFormat(1),
    });
    const results: number[] = [];
    sampleCandles.forEach((candle) => {
      const result = pDIProducer.nextValue(candle);
      if (result !== undefined) results.push(result);
    });
    assert.deepStrictEqual(
      results,
      eDtedPlusDIOutput,
      "Wrong Results while getting nextValue results"
    );
  });

  it("should be able to update a previous value using updateBar", function () {
    const pDIProducer = new PDI({
      period: 3,
      values: [...updateCandles],
      format: NumberFormat(1),
    });
    const originalResults = pDIProducer.getResult();
    assert.deepStrictEqual(
      originalResults,
      expectedUpdateOriginal,
      "Wrong original results before update"
    );

    pDIProducer.updateBar(3, updatedBar4);
    const updatedResults = pDIProducer.getResult();
    assert.deepStrictEqual(
      updatedResults,
      expectedUpdateNew,
      "Wrong Results after updateBar"
    );
  });

  it("should format results correctly using a format function", function () {
    const lowValueCandles: ICCICandle[] = [
      { open: 0.001, high: 0.002, low: 0.001, close: 0.0015, timestamp: 1 },
      { open: 0.0015, high: 0.003, low: 0.001, close: 0.002, timestamp: 2 },
      { open: 0.002, high: 0.0025, low: 0.001, close: 0.0018, timestamp: 3 },
      { open: 0.0018, high: 0.003, low: 0.001, close: 0.002, timestamp: 4 },
      { open: 0.002, high: 0.0035, low: 0.001, close: 0.0025, timestamp: 5 },
      { open: 0.0025, high: 0.003, low: 0.001, close: 0.002, timestamp: 6 },
      { open: 0.002, high: 0.003, low: 0.001, close: 0.0022, timestamp: 7 },
    ];
    const formattedResults = PDI.calculate({
      period: 4,
      values: lowValueCandles,
      format: NumberFormat(3),
    });
    formattedResults.forEach((val) => {
      const decimals = val?.toFixed(3).split(".")[1];
      assert.strictEqual(
        decimals?.length,
        3,
        "Result is not formatted to 3 decimals"
      );
    });
  });
});
