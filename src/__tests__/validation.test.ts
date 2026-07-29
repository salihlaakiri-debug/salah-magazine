import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  validateMessage,
  validateSubject,
} from "@/lib/validation";

describe("validateEmail", () => {
  it("accepts valid email", () => {
    expect(validateEmail("test@example.com").valid).toBe(true);
  });

  it("rejects empty email", () => {
    expect(validateEmail("").valid).toBe(false);
  });

  it("rejects missing email", () => {
    expect(validateEmail(undefined).valid).toBe(false);
  });

  it("rejects invalid format", () => {
    expect(validateEmail("not-an-email").valid).toBe(false);
  });

  it("rejects overly long email", () => {
    expect(validateEmail("a".repeat(250) + "@b.com").valid).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts valid password", () => {
    expect(validatePassword("password123").valid).toBe(true);
  });

  it("rejects empty password", () => {
    expect(validatePassword("").valid).toBe(false);
  });

  it("rejects short password", () => {
    expect(validatePassword("ab").valid).toBe(false);
  });

  it("rejects overly long password", () => {
    expect(validatePassword("a".repeat(200)).valid).toBe(false);
  });
});

describe("validateUsername", () => {
  it("accepts valid username", () => {
    expect(validateUsername("user_123").valid).toBe(true);
  });

  it("accepts Arabic username", () => {
    expect(validateUsername("كاتب_123").valid).toBe(true);
  });

  it("rejects short username", () => {
    expect(validateUsername("ab").valid).toBe(false);
  });

  it("rejects empty username", () => {
    expect(validateUsername("").valid).toBe(false);
  });
});

describe("validateName", () => {
  it("accepts valid name", () => {
    expect(validateName("أحمد").valid).toBe(true);
  });

  it("rejects empty name", () => {
    expect(validateName("").valid).toBe(false);
  });

  it("rejects long name", () => {
    expect(validateName("a".repeat(101)).valid).toBe(false);
  });
});

describe("validateMessage", () => {
  it("accepts valid message", () => {
    expect(validateMessage("Hello world, this is a message").valid).toBe(true);
  });

  it("rejects short message", () => {
    expect(validateMessage("Hi").valid).toBe(false);
  });

  it("rejects empty message", () => {
    expect(validateMessage("").valid).toBe(false);
  });

  it("rejects overly long message", () => {
    expect(validateMessage("a".repeat(5001)).valid).toBe(false);
  });
});

describe("validateSubject", () => {
  it("accepts valid subject", () => {
    expect(validateSubject("استفسار").valid).toBe(true);
  });

  it("accepts empty subject", () => {
    expect(validateSubject("").valid).toBe(true);
  });

  it("rejects long subject", () => {
    expect(validateSubject("a".repeat(201)).valid).toBe(false);
  });
});
