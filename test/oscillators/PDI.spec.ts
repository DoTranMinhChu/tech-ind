import assert from "assert";
import { PDI } from "../../src";
import { IPDIInput, IPDICandle } from "../../src/types";

// Dữ liệu test cho PDI với period = 3 và 6 nến
const inputPDI: IPDIInput = {
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

// Với dữ liệu tăng đơn giản ban đầu, PDI được tính từ nến thứ 2 trở đi sẽ luôn = 50.
const expectedPDI = [50, 50, 50, 50, 50];

describe("PDI (Plus Directional Indicator)", function () {
  it("should calculate PDI using the calculate method", function () {
    assert.deepEqual(
      PDI.calculate(inputPDI),
      expectedPDI,
      "Wrong Results using calculate method"
    );
  });

  it("should be able to get PDI for the next bar via getResult", function () {
    const pdi = new PDI(inputPDI);
    assert.deepEqual(
      pdi.getResult(),
      expectedPDI,
      "Wrong Results while getting results via getResult"
    );
  });

  it("should be able to get PDI for the next bar using nextValue", function () {
    const pdi = new PDI({ values: [], period: 3 });
    const results: number[] = [];
    inputPDI.values.forEach((value: IPDICandle) => {
      const result = pdi.nextValue(value);
      if (result !== undefined) results.push(result);
    });
    assert.deepEqual(
      results,
      expectedPDI,
      "Wrong Results while getting results using nextValue"
    );
  });

  it("should update PDI using updateBar", function () {
    // Ta sẽ cập nhật nến thứ 3 (index 2) để tạo ra sự thay đổi:
    // Candle ban đầu: { high: 12, low: 10, close: 11 }
    // Cập nhật thành: { high: 12, low: 9, close: 10 }
    const pdi = new PDI(inputPDI);
    pdi.updateBar(2, { high: 12, low: 9, close: 10 });

    const expectedUpdated = [50, 38.5, 35.8, 40.6, 43.8];
    assert.deepEqual(
      pdi.getResult(),
      expectedUpdated,
      "Wrong Results after updateBar for PDI"
    );
  });
});
