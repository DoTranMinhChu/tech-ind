import assert from "assert";
import { MDI } from "../../src";
import { IMDIInput, IMDICandle } from "../../src/types";

// Dữ liệu test cho MDI với period = 3 và 6 nến
const inputMDI: IMDIInput = {
  period: 3,
  values: [
    { high: 10, low: 8, close: 9 },
    { high: 11, low: 9, close: 10 },
    { high: 12, low: 10, close: 11 },
    { high: 13, low: 11, close: 12 },
    { high: 14, low: 12, close: 13 },
    { high: 15, low: 13, close: 14 },
  ],
};

// Với dữ liệu ban đầu tăng, MDI = 0 từ nến thứ 2 trở đi.
const expectedMDI = [0, 0, 0, 0, 0];

describe("MDI (Minus Directional Indicator)", function () {
  it("should calculate MDI using the calculate method", function () {
    assert.deepEqual(
      MDI.calculate(inputMDI),
      expectedMDI,
      "Wrong Results using calculate method"
    );
  });

  it("should be able to get MDI for the next bar via getResult", function () {
    const mdi = new MDI(inputMDI);
    assert.deepEqual(
      mdi.getResult(),
      expectedMDI,
      "Wrong Results while getting results via getResult"
    );
  });

  it("should be able to get MDI for the next bar using nextValue", function () {
    const mdi = new MDI({ values: [], period: 3 });
    const results: number[] = [];
    inputMDI.values.forEach((value: IMDICandle) => {
      const result = mdi.nextValue(value);
      if (result !== undefined) results.push(result);
    });
    assert.deepEqual(
      results,
      expectedMDI,
      "Wrong Results while getting results using nextValue"
    );
  });

  it("should update MDI using updateBar", function () {
    // Để thấy được sự thay đổi, cập nhật nến thứ 3 (index 2):
    // Ban đầu Candle2: { high: 12, low: 10, close: 11 }
    // Cập nhật thành: { high: 11, low: 8, close: 10 } => tạo điều kiện cho downMove mạnh hơn.
    const mdi = new MDI(inputMDI);
    mdi.updateBar(2, { high: 11, low: 8, close: 10 });

    const expectedUpdated = [0, 23.1, 11.3, 7.5, 5];
    assert.deepEqual(
      mdi.getResult(),
      expectedUpdated,
      "Wrong Results after updateBar for MDI"
    );
  });
});
