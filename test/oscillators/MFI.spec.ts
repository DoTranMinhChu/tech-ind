import { strict as assert } from "assert";
import { IMFICandle, IMFIInput, MFI } from "../../src"; // Điều chỉnh đường dẫn theo dự án của bạn
import { NumberFormat } from "../../src/utils/NumberFormatter";

describe("MFI (Money Flow Index) - Fluctuation Dataset", function () {
  // Bộ dữ liệu 20 cây nến mô phỏng giá cổ phiếu có dao động (không đơn điệu tăng)
  const candles: IMFICandle[] = [
    { high: 30, low: 28, close: 29, volume: 1000 }, // TP = 29
    { high: 31, low: 29, close: 30, volume: 1100 }, // TP = 30, so sánh với 29 → positive: 30*1100 = 33000
    { high: 30, low: 28, close: 29, volume: 1200 }, // TP = 29, so sánh với 30 → negative: 29*1200 = 34800
    { high: 29, low: 27, close: 28, volume: 1300 }, // TP = 28, so sánh với 29 → negative: 28*1300 = 36400
    { high: 30, low: 28, close: 29, volume: 1000 }, // TP = 29, so sánh với 28 → positive: 29*1000 = 29000
    { high: 31, low: 29, close: 30, volume: 1100 }, // TP = 30, so sánh với 29 → positive: 30*1100 = 33000
    { high: 30, low: 28, close: 29, volume: 1200 }, // TP = 29, so sánh với 30 → negative: 29*1200 = 34800
    { high: 29, low: 27, close: 28, volume: 1300 }, // TP = 28, so sánh với 29 → negative: 28*1300 = 36400
    { high: 28, low: 26, close: 27, volume: 1000 }, // TP = 27, so sánh với 28 → negative: 27*1000 = 27000
    { high: 29, low: 27, close: 28, volume: 1100 }, // TP = 28, so sánh với 27 → positive: 28*1100 = 30800
    { high: 30, low: 28, close: 29, volume: 1200 }, // TP = 29, so sánh với 28 → positive: 29*1200 = 34800
    { high: 31, low: 29, close: 30, volume: 1300 }, // TP = 30, so sánh với 29 → positive: 30*1300 = 39000
    { high: 32, low: 30, close: 31, volume: 1400 }, // TP = 31, so sánh với 30 → positive: 31*1400 = 43400
    { high: 33, low: 31, close: 32, volume: 1500 }, // TP = 32, so sánh với 31 → positive: 32*1500 = 48000
    { high: 32, low: 30, close: 31, volume: 1400 }, // TP = 31, so sánh với 32 → negative: 31*1400 = 43400
    { high: 31, low: 29, close: 30, volume: 1300 }, // TP = 30, so sánh với 31 → negative: 30*1300 = 39000
    { high: 30, low: 28, close: 29, volume: 1200 }, // TP = 29, so sánh với 30 → negative: 29*1200 = 34800
    { high: 29, low: 27, close: 28, volume: 1100 }, // TP = 28, so sánh với 29 → negative: 28*1100 = 30800
    { high: 30, low: 28, close: 29, volume: 1000 }, // TP = 29, so sánh với 28 → positive: 29*1000 = 29000
    { high: 31, low: 29, close: 30, volume: 900 }, // TP = 30, so sánh với 29 → positive: 30*900 = 27000
  ];

  // Với period = 14, do flows bắt đầu từ cây nến thứ 2, nên kết quả sẽ được tính từ index 14 trở đi.
  // Expected (tính toán thủ công với sai số chấp nhận ±0.5):
  const expectedMFI = [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    57.76,
    50.61,
    50.61,
    51.17,
    51.17,
    50.58,
  ];

  it("should calculate MFI using calculate method", function () {
    const input: IMFIInput = {
      period: 14,
      values: candles,
      format: NumberFormat(2),
    };
    const results = MFI.calculate(input);
    results.forEach((value, index) => {
      if (expectedMFI[index] === undefined) {
        assert.strictEqual(
          value,
          undefined,
          `Expected undefined at index ${index}`
        );
      } else {
        assert.ok(
          Math.abs(value! - expectedMFI[index]!) < 0.005,
          `Mismatch at index ${index}: expected ${expectedMFI[index]}, got ${value}`
        );
      }
    });
  });
});
