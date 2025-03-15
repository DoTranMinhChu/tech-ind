import assert from "assert";
import { LLV } from "../../src";
import { ILLVInput } from "../../src/types";

// Với dãy giá [1,3,2,5,4] và period = 3:
// HHV được tính như sau:
// - Giá trị đầu tiên: 1  (buffer: [1])
// - Giá trị thứ hai: max(1,3)=3  (buffer: [1,3])
// - Giá trị thứ ba: max(1,3,2)=3  (buffer: [1,3,2] -> shift => [3,2])
// - Giá trị thứ tư: max(3,2,5)=5  (buffer: [3,2,5] -> shift => [2,5])
// - Giá trị thứ năm: max(2,5,4)=5  (buffer: [2,5,4] -> shift => [5,4])
const input: ILLVInput = {
  period: 3,
  values: [1, 3, 2, 5, 4],
};

const expectedLLV = [1, 1, 1, 2, 2];

describe("LLV (Lowest Low Value)", function () {
  it("should calculate LLV using the calculate method", function () {
    assert.deepEqual(
      LLV.calculate(input),
      expectedLLV,
      "Wrong Results using calculate method"
    );
  });

  it("should get LLV using getResult", function () {
    const llv = new LLV(input);
    assert.deepEqual(
      llv.getResult(),
      expectedLLV,
      "Wrong Results using getResult"
    );
  });

  it("should get LLV for each new value using nextValue", function () {
    const llv = new LLV({ period: 3, values: [] });
    const results: number[] = [];
    input.values.forEach((value: number) => {
      const result = llv.nextValue(value);
      if (result !== undefined) results.push(result);
    });
    assert.deepEqual(results, expectedLLV, "Wrong Results using nextValue");
  });

  it("should update LLV using updateBar", function () {
    // Cập nhật giá trị tại index 2 từ 2 thành 0
    const llv = new LLV(input);
    llv.updateBar(2, 0);
    // Với dãy [1, 3, 0, 5, 4]:
    // - LLV[0] = 1
    // - LLV[1] = min(1,3) = 1
    // - LLV[2] = min(1,3,0) = 0  -> sau đó buffer shift: [3,0]
    // - LLV[3] = min(3,0,5) = 0  -> sau đó buffer shift: [0,5]
    // - LLV[4] = min(0,5,4) = 0
    const expectedUpdatedLLV = [1, 1, 0, 0, 0];
    assert.deepEqual(
      llv.getResult(),
      expectedUpdatedLLV,
      "Wrong Results after updateBar for LLV"
    );
  });
});
