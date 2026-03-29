export class DockerError extends Error {
  public readonly statusCode?: number;
  public readonly command?: string;

  constructor(message: string, statusCode?: number, command?: string) {
    super(message);
    this.name = "DockerError";
    this.statusCode = statusCode;
    this.command = command;
  }
}

export class DockerNotFoundError extends DockerError {
  constructor() {
    super(
      "Docker CLI not found. Make sure Docker is installed and the 'docker' command is available on your PATH.",
    );
    this.name = "DockerNotFoundError";
  }
}

export class DockerNotRunningError extends DockerError {
  constructor() {
    super(
      "Docker daemon is not running. Start Docker Desktop or the Docker service and try again.",
    );
    this.name = "DockerNotRunningError";
  }
}

export class ContainerNotFoundError extends DockerError {
  public readonly containerId: string;

  constructor(containerId: string) {
    super(`Container not found: ${containerId}`);
    this.name = "ContainerNotFoundError";
    this.containerId = containerId;
  }
}

export class ImageNotFoundError extends DockerError {
  public readonly imageRef: string;

  constructor(imageRef: string) {
    super(`Image not found: ${imageRef}`);
    this.name = "ImageNotFoundError";
    this.imageRef = imageRef;
  }
}

export class PermissionDeniedError extends DockerError {
  constructor() {
    super(
      "Permission denied. You may need to run Docker with elevated privileges or add your user to the 'docker' group.",
    );
    this.name = "PermissionDeniedError";
  }
}
