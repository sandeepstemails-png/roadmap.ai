import { describe, expect, it } from "vitest";
import {
  loginSchema,
  roadmapNodeSchema,
  roadmapSchema,
  signupSchema,
} from "./validation";

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "anything",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts a strong password", () => {
    const result = signupSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "abc12345",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password with no digit", () => {
    const result = signupSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "abcdefgh",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "ab1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = signupSchema.safeParse({
      name: "J",
      email: "jane@example.com",
      password: "abc12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("roadmapSchema", () => {
  it("accepts a valid slug", () => {
    const result = roadmapSchema.safeParse({
      title: "Frontend Basics",
      slug: "frontend-basics",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a slug with uppercase or spaces", () => {
    const result = roadmapSchema.safeParse({
      title: "Frontend Basics",
      slug: "Frontend Basics",
    });
    expect(result.success).toBe(false);
  });
});

describe("roadmapNodeSchema", () => {
  it("accepts a node without an optional resourceUrl", () => {
    const result = roadmapNodeSchema.safeParse({
      title: "HTML",
      positionX: "0",
      positionY: "0",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid resourceUrl", () => {
    const result = roadmapNodeSchema.safeParse({
      title: "HTML",
      resourceUrl: "not-a-url",
      positionX: "0",
      positionY: "0",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string positions to numbers", () => {
    const result = roadmapNodeSchema.safeParse({
      title: "HTML",
      positionX: "125",
      positionY: "300",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.positionX).toBe(125);
      expect(result.data.positionY).toBe(300);
    }
  });
});
