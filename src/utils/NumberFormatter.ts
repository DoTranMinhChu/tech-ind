function roundNumber(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

export function NumberFormat<T>(decimals: number): (value: T) => T {
  return function _numberFormat(value: T): T {
    // Nếu value là null hoặc undefined thì trả về ngay
    if (value === undefined || value === null) {
      return value;
    }
    // Nếu value là number thì làm tròn
    if (typeof value === "number") {
      return roundNumber(value, decimals) as unknown as T;
    }
    // Nếu value là mảng thì lặp qua từng phần tử và định dạng đệ quy
    if (Array.isArray(value)) {
      return value.map((item) => _numberFormat(item)) as unknown as T;
    }
    // Nếu value là object thì định dạng từng thuộc tính
    if (typeof value === "object") {
      const result: any = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          result[key] = _numberFormat((value as any)[key]);
        }
      }
      return result as T;
    }
    // Nếu không phải số, mảng hay object thì trả về nguyên value
    return value;
  };
}
