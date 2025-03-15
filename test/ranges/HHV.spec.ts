import assert from "assert";
import { HHV } from "../../src";
import { IHHVInput } from "../../src/types";

// Với dãy giá [1,3,2,5,4] và period = 3:
// HHV được tính như sau:
// - Giá trị đầu tiên: 1  (buffer: [1])
// - Giá trị thứ hai: max(1,3)=3  (buffer: [1,3])
// - Giá trị thứ ba: max(1,3,2)=3  (buffer: [1,3,2] -> shift => [3,2])
// - Giá trị thứ tư: max(3,2,5)=5  (buffer: [3,2,5] -> shift => [2,5])
// - Giá trị thứ năm: max(2,5,4)=5  (buffer: [2,5,4] -> shift => [5,4])
const input: IHHVInput = {
  period: 3,
  values: [1, 3, 2, 5, 4],
};

const expectedHHV = [1, 3, 3, 5, 5];

describe("HHV (Highest High Value)", function () {
  it("should calculate HHV using the calculate method", function () {
    assert.deepEqual(
      HHV.calculate(input),
      expectedHHV,
      "Wrong Results using calculate method"
    );
  });

  it("should get HHV using getResult", function () {
    const hhv = new HHV(input);
    assert.deepEqual(
      hhv.getResult(),
      expectedHHV,
      "Wrong Results using getResult"
    );
  });

  it("should get HHV for each new value using nextValue", function () {
    const hhv = new HHV({ period: 3, values: [] });
    const results: number[] = [];
    input.values.forEach((value: number) => {
      const result = hhv.nextValue(value);
      if (result !== undefined) results.push(result);
    });
    assert.deepEqual(results, expectedHHV, "Wrong Results using nextValue");
  });

  it("should update HHV using updateBar", function () {
    // Cập nhật giá trị tại index 2 từ 2 thành 6
    const hhv = new HHV(input);
    hhv.updateBar(2, 6);
    // Với dãy [1, 3, 6, 5, 4]:
    // - HHV[0] = 1
    // - HHV[1] = max(1,3) = 3
    // - HHV[2] = max(1,3,6) = 6  -> sau đó buffer shift: [3,6]
    // - HHV[3] = max(3,6,5) = 6  -> sau đó buffer shift: [6,5]
    // - HHV[4] = max(6,5,4) = 6
    const expectedUpdatedHHV = [1, 3, 6, 6, 6];
    assert.deepEqual(
      hhv.getResult(),
      expectedUpdatedHHV,
      "Wrong Results after updateBar for HHV"
    );
  });
});
