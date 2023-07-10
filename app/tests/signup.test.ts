import { validateEmail, validateUsername } from "../utils";

describe("Verify if email is valid with validateEmail", () => {
  it("should return false for non-emails", () => {
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("not-an-email")).toBe(false);
    expect(validateEmail("n@")).toBe(false);
  });

  it("should return true for emails", () => {
    expect(validateEmail("touitos@example.com")).toBe(true);
  });
});

describe("Verify if username is valid", () => {
  it("should return false for non valid username", () => {
    expect(validateUsername(undefined)).toBe(false);
    expect(validateUsername(null)).toBe(false);
    expect(validateUsername("")).toBe(false);
  });

  it("should return true for valid usernames", () => {
    expect(validateUsername("validUsername")).toBe(true);
  });
});
