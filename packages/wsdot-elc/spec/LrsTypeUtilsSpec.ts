import { getLrsTypeValue, LrsType } from "../src/lrsTypeUtils";

describe("getLrsTypeValue", () => {
  it("maps recognized prefixes to the matching LrsType", () => {
    expect(getLrsTypeValue("increase")).toBe(LrsType.INCREASE);
    expect(getLrsTypeValue("decrease")).toBe(LrsType.DECREASE);
    expect(getLrsTypeValue("both")).toBe(LrsType.BOTH);
    expect(getLrsTypeValue("ramp")).toBe(LrsType.RAMP);
    expect(getLrsTypeValue("ft")).toBe(LrsType.FT);
    expect(getLrsTypeValue("turnback")).toBe(LrsType.TURNBACK);
    expect(getLrsTypeValue("TB")).toBe(LrsType.TURNBACK);
  });

  it("passes through valid numeric inputs unchanged", () => {
    expect(getLrsTypeValue(1)).toBe(1);
    expect(getLrsTypeValue(8)).toBe(8);
    expect(getLrsTypeValue(16)).toBe(16);
  });

  it("throws on unrecognized strings that merely contain a 't'", () => {
    // These fall through every prefix branch but contain a 't', so the
    // unanchored turnback test used to misclassify them as TURNBACK.
    expect(() => getLrsTypeValue("exit")).toThrowError(/Invalid value/);
    expect(() => getLrsTypeValue("auto")).toThrowError(/Invalid value/);
    expect(() => getLrsTypeValue("state")).toThrowError(/Invalid value/);
    expect(() => getLrsTypeValue("light")).toThrowError(/Invalid value/);
    expect(() => getLrsTypeValue("nest")).toThrowError(/Invalid value/);
  });
});
