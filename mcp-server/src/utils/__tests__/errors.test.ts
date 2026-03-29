import { describe, it, expect } from "vitest";
import {
  DockerError,
  DockerNotFoundError,
  DockerNotRunningError,
  ContainerNotFoundError,
  ImageNotFoundError,
  PermissionDeniedError,
} from "../errors.js";

describe("DockerError", () => {
  it("creates with message only", () => {
    const err = new DockerError("something broke");
    expect(err.message).toBe("something broke");
    expect(err.name).toBe("DockerError");
    expect(err.statusCode).toBeUndefined();
    expect(err.command).toBeUndefined();
    expect(err).toBeInstanceOf(Error);
  });

  it("creates with all fields", () => {
    const err = new DockerError("failed", 1, "ps");
    expect(err.statusCode).toBe(1);
    expect(err.command).toBe("ps");
  });
});

describe("DockerNotFoundError", () => {
  it("has correct name and message", () => {
    const err = new DockerNotFoundError();
    expect(err.name).toBe("DockerNotFoundError");
    expect(err.message).toContain("not found");
    expect(err).toBeInstanceOf(DockerError);
  });
});

describe("DockerNotRunningError", () => {
  it("has correct name and message", () => {
    const err = new DockerNotRunningError();
    expect(err.name).toBe("DockerNotRunningError");
    expect(err.message).toContain("not running");
    expect(err).toBeInstanceOf(DockerError);
  });
});

describe("ContainerNotFoundError", () => {
  it("includes container ID in message", () => {
    const err = new ContainerNotFoundError("abc123");
    expect(err.name).toBe("ContainerNotFoundError");
    expect(err.containerId).toBe("abc123");
    expect(err.message).toContain("abc123");
    expect(err).toBeInstanceOf(DockerError);
  });
});

describe("ImageNotFoundError", () => {
  it("includes image ref in message", () => {
    const err = new ImageNotFoundError("nginx:latest");
    expect(err.name).toBe("ImageNotFoundError");
    expect(err.imageRef).toBe("nginx:latest");
    expect(err.message).toContain("nginx:latest");
    expect(err).toBeInstanceOf(DockerError);
  });
});

describe("PermissionDeniedError", () => {
  it("has correct name and message", () => {
    const err = new PermissionDeniedError();
    expect(err.name).toBe("PermissionDeniedError");
    expect(err.message).toContain("Permission denied");
    expect(err).toBeInstanceOf(DockerError);
  });
});
