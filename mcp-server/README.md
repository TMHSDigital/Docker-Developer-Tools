# @tmhs/docker-mcp

MCP server for Docker CLI integration - 49 tools for containers, images, Compose, volumes, networks, cleanup, and system info.

Part of the [Docker Developer Tools](https://github.com/TMHSDigital/Docker-Developer-Tools) Cursor plugin.

## Requirements

- Node.js >= 20
- Docker CLI (`docker`) available on PATH

## Installation

```bash
npm install -g @tmhs/docker-mcp
```

Or run directly with npx:

```bash
npx @tmhs/docker-mcp
```

## Cursor MCP Configuration

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "docker": {
      "command": "npx",
      "args": ["-y", "@tmhs/docker-mcp"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "docker": {
      "command": "docker-mcp"
    }
  }
}
```

## Tools (49)

### Read / Inspect (10)

| Tool | Description |
|------|-------------|
| `docker_listContainers` | List running/all containers |
| `docker_inspectContainer` | Detailed container info |
| `docker_containerLogs` | Fetch container logs |
| `docker_listImages` | List local images |
| `docker_inspectImage` | Detailed image metadata |
| `docker_listVolumes` | List volumes |
| `docker_listNetworks` | List networks |
| `docker_systemInfo` | Docker system info |
| `docker_diskUsage` | Disk usage breakdown |
| `docker_searchHub` | Search Docker Hub |

### Container Lifecycle (10)

| Tool | Description |
|------|-------------|
| `docker_run` | Create and start a container |
| `docker_create` | Create a container without starting |
| `docker_start` | Start a stopped container |
| `docker_stop` | Stop a running container |
| `docker_restart` | Restart a container |
| `docker_kill` | Send a signal to a container |
| `docker_rm` | Remove a container |
| `docker_pause` | Pause container processes |
| `docker_unpause` | Unpause a container |
| `docker_exec` | Execute a command in a container |

### Image and Build (8)

| Tool | Description |
|------|-------------|
| `docker_pull` | Pull an image from a registry |
| `docker_push` | Push an image to a registry |
| `docker_build` | Build an image from a Dockerfile |
| `docker_tag` | Tag an image |
| `docker_rmi` | Remove images |
| `docker_commit` | Create image from container changes |
| `docker_save` | Save images to tar archive |
| `docker_load` | Load images from tar archive |

### Compose (8)

| Tool | Description |
|------|-------------|
| `docker_composeUp` | Create and start Compose services |
| `docker_composeDown` | Stop and remove Compose services |
| `docker_composePs` | List Compose project containers |
| `docker_composeLogs` | View Compose service logs |
| `docker_composeBuild` | Build Compose service images |
| `docker_composeRestart` | Restart Compose services |
| `docker_composePull` | Pull Compose service images |
| `docker_composeExec` | Execute command in a Compose service |

### Volume Management (4)

| Tool | Description |
|------|-------------|
| `docker_volumeCreate` | Create a named volume |
| `docker_volumeRm` | Remove volumes |
| `docker_volumeInspect` | Detailed volume info |
| `docker_volumePrune` | Remove unused volumes |

### Network Management (6)

| Tool | Description |
|------|-------------|
| `docker_networkCreate` | Create a network |
| `docker_networkRm` | Remove networks |
| `docker_networkConnect` | Connect container to network |
| `docker_networkDisconnect` | Disconnect container from network |
| `docker_networkInspect` | Detailed network info |
| `docker_networkPrune` | Remove unused networks |

### Cleanup / Prune (3)

| Tool | Description |
|------|-------------|
| `docker_systemPrune` | Remove unused containers, networks, images |
| `docker_containerPrune` | Remove stopped containers |
| `docker_imagePrune` | Remove unused images |

## License

CC-BY-NC-ND-4.0 - Copyright 2026 TM Hospitality Strategies
