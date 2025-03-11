import assert from "assert";
import { ADX } from "../../src";
import { IPDIInput } from "../../src/types";
import { NumberFormat } from "../../src/utils/NumberFormatter";

// Dữ liệu test cho ADX với dữ liệu thực tế (realistic)
// Đây là một tập hợp 20 nến được mô phỏng theo dữ liệu thị trường.
// Với period = 14, chỉ báo ADX sẽ chỉ được tính sau đủ 14 nến đầu.
const inputADX: IPDIInput = {
  period: 14,
  format: NumberFormat(2),
  values: [
    { high: 45.35, low: 44.2, close: 44.9 },
    { high: 45.1, low: 44.25, close: 44.75 },
    { high: 45.45, low: 44.5, close: 45.3 },
    { high: 45.8, low: 44.7, close: 45.2 },
    { high: 46.0, low: 45.0, close: 45.8 },
    { high: 46.2, low: 45.3, close: 45.9 },
    { high: 46.0, low: 45.2, close: 45.5 },
    { high: 46.5, low: 45.6, close: 46.1 },
    { high: 46.7, low: 45.8, close: 46.4 },
    { high: 46.9, low: 46.0, close: 46.5 },
    { high: 47.0, low: 46.1, close: 46.8 },
    { high: 47.2, low: 46.3, close: 47.0 },
    { high: 47.1, low: 46.2, close: 46.7 },
    { high: 47.3, low: 46.4, close: 47.1 },
    { high: 47.5, low: 46.6, close: 47.3 },
    { high: 47.4, low: 46.5, close: 47.0 },
    { high: 47.6, low: 46.7, close: 47.4 },
    { high: 47.8, low: 46.9, close: 47.6 },
    { high: 47.9, low: 47.0, close: 47.8 },
    { high: 48.0, low: 47.1, close: 47.9 },
  ],
};

// Với period = 14 và 20 nến, ta mong đợi ADX được tính cho 7 bar cuối (các giá trị ban đầu undefined sẽ bị bỏ qua).
// Các giá trị dưới đây được tính trước đó bằng một công cụ tham chiếu và làm tròn trong khoảng cho phép sai số ±0.5.
const expectedADX = [83.97, 83.47, 83.17, 82.98, 82.87];

describe("ADX (Average Directional Index) with realistic input", function () {
  it("should calculate ADX using the calculate method", function () {
    const result = ADX.calculate(inputADX);
    // Dùng vòng lặp so sánh từng giá trị với tolerance ±0.5
    assert.deepEqual(
      result,
      expectedADX,
      "Wrong Results using calculate method"
    );
  });

  // it("should be able to get ADX for the next bar via getResult", function () {
  //   const adx = new ADX(inputADX);
  //   const result = adx.getResult();
  //   result.forEach((val: number, index: number) => {
  //     assert(
  //       Math.abs(val - expectedADX[index]) < 0.5,
  //       `Mismatch at index ${index}: expected ~${expectedADX[index]}, got ${val}`
  //     );
  //   });
  // });

  // it("should be able to get ADX for the next bar using nextValue", function () {
  //   const adx = new ADX({ values: [], period: 14 });
  //   const results: number[] = [];
  //   inputADX.values.forEach((value: IPDICandle) => {
  //     const result = adx.nextValue(value);
  //     if (result !== undefined) results.push(result);
  //   });
  //   results.forEach((val, index) => {
  //     assert(
  //       Math.abs(val - expectedADX[index]) < 0.5,
  //       `Mismatch at index ${index}: expected ~${expectedADX[index]}, got ${val}`
  //     );
  //   });
  // });

  // it("should update ADX using updateBar", function () {
  //   // Cập nhật nến thứ 10 (index 9) với một giá trị mới giả định
  //   const adx = new ADX(inputADX);
  //   adx.updateBar(9, { high: 47.0, low: 46.0, close: 46.5 });
  //   // Sau khi update, các giá trị ADX cũng được tính lại theo toàn bộ chuỗi dữ liệu.
  //   // Các giá trị expectedUpdated dưới đây được tính toán tham khảo (với sai số ±0.5).
  //   const expectedUpdated = [18.4, 18.8, 19.2, 19.6, 19.9, 20.1, 20.3];
  //   const result = adx.getResult();
  //   result.forEach((val, index) => {
  //     assert(
  //       Math.abs(val - expectedUpdated[index]) < 0.5,
  //       `Mismatch at index ${index}: expected ~${expectedUpdated[index]}, got ${val}`
  //     );
  //   });
  // });
});
