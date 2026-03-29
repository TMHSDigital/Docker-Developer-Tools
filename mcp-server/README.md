# @tmhs/docker-mcp

MCP server for Docker CLI integration - 122 tools for containers, images, complete Compose V2, volumes, networks, cleanup, observability, buildx, manifests, contexts, registry auth, Swarm orchestration, and system info.

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

## Tools (122)

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

### Compose (24)

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
| `docker_composeConfig` | Validate and render a Compose file |
| `docker_composeCp` | Copy files to/from a Compose service |
| `docker_composeCreate` | Create containers without starting |
| `docker_composeEvents` | Real-time Compose container events |
| `docker_composeImages` | List images used by services |
| `docker_composeKill` | Force stop service containers |
| `docker_composeLs` | List Compose projects |
| `docker_composePause` | Pause Compose services |
| `docker_composeUnpause` | Unpause Compose services |
| `docker_composePort` | Get public port for a binding |
| `docker_composeRm` | Remove stopped service containers |
| `docker_composeRun` | Run one-off command on a service |
| `docker_composeScale` | Scale services to replica count |
| `docker_composeStart` | Start existing service containers |
| `docker_composeStop` | Stop services without removing |
| `docker_composeTop` | Running processes per service |

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

### Advanced / Observability (6)

| Tool | Description |
|------|-------------|
| `docker_cp` | Copy files between container and host |
| `docker_stats` | Live resource usage statistics |
| `docker_top` | Running processes in a container |
| `docker_events` | Real-time Docker daemon events |
| `docker_update` | Update container resource config |
| `docker_wait` | Wait for container to stop |

### Buildx (8)

| Tool | Description |
|------|-------------|
| `docker_buildxBuild` | Multi-platform builds with buildx |
| `docker_buildxLs` | List builder instances |
| `docker_buildxCreate` | Create a new builder instance |
| `docker_buildxRm` | Remove a builder instance |
| `docker_buildxInspect` | Inspect a builder instance |
| `docker_buildxUse` | Set the default builder |
| `docker_buildxImagetools` | Inspect or create manifest lists via buildx |
| `docker_builderPrune` | Remove build cache |

### Manifest (5)

| Tool | Description |
|------|-------------|
| `docker_manifestCreate` | Create a manifest list for multi-arch images |
| `docker_manifestInspect` | Display a manifest or manifest list |
| `docker_manifestAnnotate` | Add platform info to a manifest entry |
| `docker_manifestPush` | Push a manifest list to a registry |
| `docker_manifestRm` | Remove local manifest lists |

### Container Gaps (4)

| Tool | Description |
|------|-------------|
| `docker_diff` | Inspect filesystem changes in a container |
| `docker_export` | Export container filesystem as tar |
| `docker_port` | List port mappings for a container |
| `docker_rename` | Rename a container |

### Image Gaps (2)

| Tool | Description |
|------|-------------|
| `docker_imageHistory` | Show layer history of an image |
| `docker_import` | Import tarball as filesystem image |

### Context Management (6)

| Tool | Description |
|------|-------------|
| `docker_contextCreate` | Create a context for remote hosts |
| `docker_contextLs` | List available contexts |
| `docker_contextInspect` | Detailed context info |
| `docker_contextRm` | Remove contexts |
| `docker_contextUse` | Set active context |
| `docker_contextShow` | Print current context name |

### Registry Authentication (2)

| Tool | Description |
|------|-------------|
| `docker_login` | Authenticate to a registry |
| `docker_logout` | Log out from a registry |

### Swarm Cluster (8)

| Tool | Description |
|------|-------------|
| `docker_swarmInit` | Initialize a new Swarm cluster |
| `docker_swarmJoin` | Join a Swarm as worker or manager |
| `docker_swarmLeave` | Leave the Swarm |
| `docker_swarmJoinToken` | Display or rotate join tokens |
| `docker_swarmUpdate` | Update Swarm configuration |
| `docker_swarmUnlock` | Unlock a locked Swarm manager |
| `docker_swarmUnlockKey` | Display or rotate the unlock key |
| `docker_swarmCa` | Display and rotate root CA certificate |

### Swarm Services (9)

| Tool | Description |
|------|-------------|
| `docker_serviceCreate` | Create a replicated or global service |
| `docker_serviceUpdate` | Update a service |
| `docker_serviceRm` | Remove services |
| `docker_serviceLs` | List services |
| `docker_serviceInspect` | Inspect a service |
| `docker_serviceLogs` | Fetch service logs |
| `docker_servicePs` | List tasks of a service |
| `docker_serviceScale` | Scale services |
| `docker_serviceRollback` | Rollback a service |

### Swarm Nodes (7)

| Tool | Description |
|------|-------------|
| `docker_nodeLs` | List nodes in the Swarm |
| `docker_nodeInspect` | Inspect a node |
| `docker_nodePs` | List tasks on a node |
| `docker_nodeRm` | Remove nodes |
| `docker_nodeUpdate` | Update node metadata |
| `docker_nodePromote` | Promote workers to managers |
| `docker_nodeDemote` | Demote managers to workers |

## License

CC-BY-NC-ND-4.0 - Copyright 2026 TM Hospitality Strategies
