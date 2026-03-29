import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("docker_listContainers input validation", () => {
  const schema = z.object({
    all: z.boolean().optional().default(false),
    limit: z.number().int().positive().optional(),
    filter: z.string().optional(),
  });

  it("accepts empty input with defaults", () => {
    const result = schema.parse({});
    expect(result.all).toBe(false);
  });

  it("accepts all=true", () => {
    const result = schema.parse({ all: true });
    expect(result.all).toBe(true);
  });

  it("rejects negative limit", () => {
    expect(() => schema.parse({ limit: -1 })).toThrow();
  });

  it("rejects non-integer limit", () => {
    expect(() => schema.parse({ limit: 1.5 })).toThrow();
  });
});

describe("docker_inspectContainer input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
  });

  it("accepts valid container ID", () => {
    const result = schema.parse({ containerId: "abc123" });
    expect(result.containerId).toBe("abc123");
  });

  it("accepts container name", () => {
    const result = schema.parse({ containerId: "my-container" });
    expect(result.containerId).toBe("my-container");
  });

  it("rejects empty string", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });

  it("rejects missing containerId", () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe("docker_containerLogs input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    tail: z.number().int().positive().optional().default(100),
    since: z.string().optional(),
    timestamps: z.boolean().optional().default(false),
  });

  it("applies default tail of 100", () => {
    const result = schema.parse({ containerId: "test" });
    expect(result.tail).toBe(100);
  });

  it("accepts custom tail value", () => {
    const result = schema.parse({ containerId: "test", tail: 50 });
    expect(result.tail).toBe(50);
  });

  it("rejects zero tail", () => {
    expect(() => schema.parse({ containerId: "test", tail: 0 })).toThrow();
  });

  it("accepts since parameter", () => {
    const result = schema.parse({ containerId: "test", since: "10m" });
    expect(result.since).toBe("10m");
  });
});

describe("docker_inspectImage input validation", () => {
  const schema = z.object({
    imageRef: z.string().min(1),
  });

  it("accepts image name with tag", () => {
    const result = schema.parse({ imageRef: "nginx:alpine" });
    expect(result.imageRef).toBe("nginx:alpine");
  });

  it("accepts image ID", () => {
    const result = schema.parse({ imageRef: "sha256:abc123def456" });
    expect(result.imageRef).toBe("sha256:abc123def456");
  });

  it("rejects empty string", () => {
    expect(() => schema.parse({ imageRef: "" })).toThrow();
  });
});

describe("docker_searchHub input validation", () => {
  const schema = z.object({
    term: z.string().min(1),
    limit: z.number().int().min(1).max(100).optional().default(25),
    filter: z.string().optional(),
  });

  it("accepts search term with defaults", () => {
    const result = schema.parse({ term: "nginx" });
    expect(result.term).toBe("nginx");
    expect(result.limit).toBe(25);
  });

  it("accepts custom limit", () => {
    const result = schema.parse({ term: "postgres", limit: 10 });
    expect(result.limit).toBe(10);
  });

  it("rejects limit over 100", () => {
    expect(() => schema.parse({ term: "nginx", limit: 200 })).toThrow();
  });

  it("rejects limit of 0", () => {
    expect(() => schema.parse({ term: "nginx", limit: 0 })).toThrow();
  });

  it("rejects empty search term", () => {
    expect(() => schema.parse({ term: "" })).toThrow();
  });

  it("accepts filter", () => {
    const result = schema.parse({ term: "nginx", filter: "is-official=true" });
    expect(result.filter).toBe("is-official=true");
  });
});
