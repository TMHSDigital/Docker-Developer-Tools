import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  DockerError,
  DockerNotFoundError,
  DockerNotRunningError,
  ContainerNotFoundError,
  ImageNotFoundError,
  VolumeNotFoundError,
  NetworkNotFoundError,
  PermissionDeniedError,
} from "./errors.js";

const execFileAsync = promisify(execFile);

const EXEC_TIMEOUT_MS = 30_000;

export async function checkDockerAvailable(): Promise<void> {
  try {
    await execFileAsync("docker", ["version", "--format", "json"], {
      timeout: EXEC_TIMEOUT_MS,
    });
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException & { stderr?: string };
    if (err.code === "ENOENT") {
      throw new DockerNotFoundError();
    }
    if (
      err.stderr?.includes("Cannot connect") ||
      err.stderr?.includes("Is the docker daemon running")
    ) {
      throw new DockerNotRunningError();
    }
    if (
      err.stderr?.includes("permission denied") ||
      err.stderr?.includes("Permission denied")
    ) {
      throw new PermissionDeniedError();
    }
    throw new DockerError(`Docker check failed: ${err.message}`);
  }
}

export interface ExecDockerOptions {
  timeout?: number;
  parseJson?: boolean;
}

export async function execDocker(
  args: string[],
  options: ExecDockerOptions = {},
): Promise<string> {
  const { timeout = EXEC_TIMEOUT_MS } = options;

  try {
    const { stdout, stderr } = await execFileAsync("docker", args, {
      timeout,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stderr && !stdout) {
      throw new DockerError(stderr.trim());
    }

    return stdout;
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException & { stderr?: string };

    if (err.code === "ENOENT") {
      throw new DockerNotFoundError();
    }

    const stderr = err.stderr ?? err.message ?? "";

    if (
      stderr.includes("Cannot connect") ||
      stderr.includes("Is the docker daemon running")
    ) {
      throw new DockerNotRunningError();
    }

    if (
      stderr.includes("permission denied") ||
      stderr.includes("Permission denied")
    ) {
      throw new PermissionDeniedError();
    }

    if (stderr.includes("No such container")) {
      const match = stderr.match(/No such container:\s*(\S+)/);
      throw new ContainerNotFoundError(match?.[1] ?? "unknown");
    }

    if (
      stderr.includes("No such image") ||
      stderr.includes("reference does not exist")
    ) {
      const match = stderr.match(/No such image:\s*(\S+)/);
      throw new ImageNotFoundError(match?.[1] ?? "unknown");
    }

    if (stderr.includes("No such volume")) {
      const match = stderr.match(/No such volume:\s*(\S+)/);
      throw new VolumeNotFoundError(match?.[1] ?? "unknown");
    }

    if (stderr.includes("No such network") || /network\s+\S+\s+not found/.test(stderr)) {
      const match = stderr.match(/No such network:\s*(\S+)/) ?? stderr.match(/network\s+(\S+)\s+not found/);
      throw new NetworkNotFoundError(match?.[1] ?? "unknown");
    }

    throw new DockerError(stderr.trim() || err.message, undefined, args[0]);
  }
}

export function parseJsonLines(output: string): unknown[] {
  const lines = output.trim().split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line));
}

export function errorResponse(error: unknown): {
  content: { type: "text"; text: string }[];
  isError: true;
} {
  if (error instanceof Error) {
    return {
      content: [{ type: "text" as const, text: error.message }],
      isError: true,
    };
  }
  return {
    content: [{ type: "text" as const, text: "An unknown error occurred." }],
    isError: true,
  };
}
