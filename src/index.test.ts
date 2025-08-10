import { hello } from "./index.ts"

describe("hello", () => {
  it("should say hello to the world", () => {
    expect(hello("world")).toBe("Hello, world")
  })
})
