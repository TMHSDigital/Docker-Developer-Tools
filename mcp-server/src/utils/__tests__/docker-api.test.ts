import { describe, it, expect, vi, afterEach } from "vitest";
import { errorResponse, parseJsonLines } from "../docker-api.js";
import {
  DockerError,
  DockerNotFoundError,
  ContainerNotFoundError,
} from "../errors.js";

describe("errorResponse", () => {
  it("returns error content for Error instances", () => {
    const result = errorResponse(new Error("test error"));
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("test error");
  });

  it("returns error content for DockerError", () => {
    const result = errorResponse(new DockerNotFoundError());
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("not found");
  });

  it("returns generic message for non-Error", () => {
    const result = errorResponse("string error");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("An unknown error occurred.");
  });

  it("returns generic message for null", () => {
    const result = errorResponse(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("An unknown error occurred.");
  });
});

describe("parseJsonLines", () => {
  it("parses single JSON line", () => {
    const result = parseJsonLines('{"name":"test"}\n');
    expect(result).toEqual([{ name: "test" }]);
  });

  it("parses multiple JSON lines", () => {
    const input = '{"id":"1"}\n{"id":"2"}\n{"id":"3"}\n';
    const result = parseJsonLines(input);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ id: "1" });
    expect(result[2]).toEqual({ id: "3" });
  });

  it("handles empty input", () => {
    const result = parseJsonLines("");
    expect(result).toEqual([]);
  });

  it("ignores blank lines", () => {
    const input = '{"a":1}\n\n{"b":2}\n';
    const result = parseJsonLines(input);
    expect(result).toHaveLength(2);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseJsonLines("not json")).toThrow();
  });
});
