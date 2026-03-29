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
  if (error instanceof DockerError) {
    const parts: string[] = [`[${error.name}] ${error.message}`];

    if (error.command) {
      parts.push(`Command: docker ${error.command}`);
    }

    const suggestion = getErrorSuggestion(error);
    if (suggestion) {
      parts.push(`Suggestion: ${suggestion}`);
    }

    return {
      content: [{ type: "text" as const, text: parts.join("\n") }],
      isError: true,
    };
  }
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

function getErrorSuggestion(error: DockerError): string | null {
  if (error instanceof DockerNotFoundError) {
    return "Install Docker (https://docs.docker.com/get-docker/) and ensure 'docker' is on your PATH.";
  }
  if (error instanceof DockerNotRunningError) {
    return "Start Docker Desktop or run 'sudo systemctl start docker' on Linux.";
  }
  if (error instanceof ContainerNotFoundError) {
    return "Run docker_listContainers with all=true to see all containers including stopped ones.";
  }
  if (error instanceof ImageNotFoundError) {
    return "Run docker_listImages to see available local images, or docker_pull to download from a registry.";
  }
  if (error instanceof VolumeNotFoundError) {
    return "Run docker_listVolumes to see available volumes.";
  }
  if (error instanceof NetworkNotFoundError) {
    return "Run docker_listNetworks to see available networks.";
  }
  if (error instanceof PermissionDeniedError) {
    return "Add your user to the docker group: 'sudo usermod -aG docker $USER' then log out and back in.";
  }
  return null;
}
