<p align="center">
  <img src="assets/logo.png" alt="Docker Developer Tools Logo" width="120" />
</p>

<h1 align="center">Docker Developer Tools</h1>

<p align="center">
  <em>Expert Docker workflows, directly inside Cursor.</em>
</p>

<p align="center">
  <a href="https://github.com/TMHSDigital/Docker-Developer-Tools/actions/workflows/validate.yml"><img src="https://img.shields.io/github/actions/workflow/status/TMHSDigital/Docker-Developer-Tools/validate.yml?branch=main&label=CI" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-CC--BY--NC--ND--4.0-blue" alt="License" /></a>
  <img src="https://img.shields.io/badge/version-0.3.0-green" alt="Version" />
  <a href="https://www.npmjs.com/package/@tmhs/docker-mcp"><img src="https://img.shields.io/npm/v/@tmhs/docker-mcp" alt="npm" /></a>
  <a href="https://github.com/TMHSDigital/Docker-Developer-Tools/stargazers"><img src="https://img.shields.io/github/stars/TMHSDigital/Docker-Developer-Tools" alt="Stars" /></a>
  <img src="https://img.shields.io/github/last-commit/TMHSDigital/Docker-Developer-Tools" alt="Last Commit" />
  <img src="https://img.shields.io/badge/Cursor-Plugin-purple" alt="Cursor Plugin" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <strong>12 skills</strong>&nbsp;&bull;&nbsp;<strong>6 rules</strong>&nbsp;&bull;&nbsp;<strong>28 MCP tools</strong>
</p>

---

## Quick Start

Install the plugin, then ask Cursor anything about Docker:

```text
"Write a production Dockerfile for my Node.js app with multi-stage builds"
```

```text
"My container keeps restarting - help me debug it"
```

```text
"Set up a docker-compose stack with Postgres, Redis, and my API"
```

---

## How It Works

```mermaid
flowchart LR
    A[User asks Docker question] --> B[Cursor loads a Skill]
    B --> C[Skill guides the response]
    C --> D[MCP tools fetch live Docker data]
    D --> E[User gets expert help]
```

---

## Features

Skills are grouped by category. Each skill is a self-contained guide that Cursor loads on demand.

| Category | Skill | Description |
|---|---|---|
| **Core** | `dockerfile-best-practices` | Multi-stage builds, layer caching, base image selection |
| **Core** | `docker-compose-helper` | Service definitions, networking, volumes, environment config |
| **Core** | `docker-troubleshooting` | Diagnose crashes, restarts, network failures, and permission issues |
| **Optimization** | `image-optimization` | Reduce image size, speed up builds, minimize attack surface |
| **Optimization** | `docker-resource-management` | CPU/memory limits, resource monitoring, OOM prevention |
| **Networking & Storage** | `docker-networking` | Bridge, overlay, host networking, DNS resolution, port mapping |
| **Networking & Storage** | `docker-volumes` | Named volumes, bind mounts, tmpfs, backup and restore strategies |
| **Security** | `docker-security` | Image scanning, rootless containers, secrets management, hardening |
| **DevOps** | `docker-ci-cd` | GitHub Actions, GitLab CI, build caching, registry push workflows |
| **DevOps** | `docker-registry` | Private registries, image tagging strategies, cleanup policies |
| **DevOps** | `docker-development-env` | Dev containers, hot reload, debugger attachment, local stacks |
| **Debugging** | `container-debugging` | Exec into containers, log analysis, health checks, process inspection |

---

## Rules

Rules enforce best practices automatically, without needing to invoke a skill.

| Rule | Scope | What It Does |
|---|---|---|
| `dockerfile-lint` | `**/Dockerfile*` | Flag antipatterns - unpinned bases, root user, ADD misuse, missing cleanup |
| `docker-secrets` | Global (always active) | Flag hardcoded passwords, tokens, and registry credentials |
| `compose-validation` | Compose files | Flag missing healthchecks, privileged mode, host networking |
| `docker-resource-limits` | Docker-related files | Flag missing memory and CPU limits |
| `docker-image-pinning` | Dockerfiles, compose files | Flag unpinned image tags (`:latest` or no tag) |
| `docker-port-conflicts` | Dockerfiles, compose files | Flag commonly conflicting port mappings |

---

## Companion: Docker MCP Server

The MCP server gives Cursor live access to your local Docker environment.

<p>
  <a href="https://www.npmjs.com/package/@tmhs/docker-mcp"><img src="https://img.shields.io/npm/v/@tmhs/docker-mcp" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@tmhs/docker-mcp"><img src="https://img.shields.io/npm/dm/@tmhs/docker-mcp" alt="npm downloads" /></a>
</p>

Add to your Cursor MCP config (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "docker": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "cwd": "<path-to>/Docker-Developer-Tools"
    }
  }
}
```

### Tools

#### Read / Inspect

| Tool | What It Does |
|---|---|
| `docker_listContainers` | List running and stopped containers with status, ports, and names |
| `docker_inspectContainer` | Get detailed config, state, and networking for a specific container |
| `docker_containerLogs` | Retrieve stdout/stderr logs with optional tail and timestamp filters |
| `docker_listImages` | List local images with tags, sizes, and creation dates |
| `docker_inspectImage` | Get layer history, environment variables, and labels for an image |
| `docker_listVolumes` | List Docker volumes with driver and mount point info |
| `docker_listNetworks` | List Docker networks with driver, scope, and connected containers |
| `docker_diskUsage` | Show disk space used by images, containers, volumes, and build cache |
| `docker_systemInfo` | Return Docker daemon version, OS, storage driver, and runtime info |
| `docker_searchHub` | Search Docker Hub for images by name with filtering options |

#### Container Lifecycle

| Tool | What It Does |
|---|---|
| `docker_run` | Create and start a container from an image (ports, env, volumes, network) |
| `docker_create` | Create a container without starting it |
| `docker_start` | Start a stopped container |
| `docker_stop` | Stop a running container with optional grace period |
| `docker_restart` | Restart a container with optional grace period |
| `docker_kill` | Send a signal to a running container (default: SIGKILL) |
| `docker_rm` | Remove a container (with optional force and volume removal) |
| `docker_pause` | Pause all processes in a running container |
| `docker_unpause` | Unpause a paused container |
| `docker_exec` | Execute a command in a running container |

#### Image and Build

| Tool | What It Does |
|---|---|
| `docker_pull` | Pull an image or repository from a registry |
| `docker_push` | Push an image or repository to a registry |
| `docker_build` | Build an image from a Dockerfile and context directory |
| `docker_tag` | Create a tag that refers to a source image |
| `docker_rmi` | Remove one or more images |
| `docker_commit` | Create a new image from a container's changes |
| `docker_save` | Save one or more images to a tar archive |
| `docker_load` | Load images from a tar archive |

---

## Installation

### Plugin

Symlink this repo into your Cursor plugins directory:

```powershell
# Windows (PowerShell - run as admin)
New-Item -ItemType SymbolicLink `
  -Path "$env:USERPROFILE\.cursor\plugins\docker-developer-tools" `
  -Target "<path-to>\Docker-Developer-Tools"
```

```bash
# macOS / Linux
ln -s /path/to/Docker-Developer-Tools ~/.cursor/plugins/docker-developer-tools
```

### MCP Server

```bash
cd mcp-server
npm install
npm run build
```

Then add the JSON config from the [MCP Server section](#companion-docker-mcp-server) to `.cursor/mcp.json`.

---

## Example Prompts

One prompt per skill showing practical usage:

| Skill | Try This |
|---|---|
| `dockerfile-best-practices` | "Write a production Dockerfile for a Python Flask app" |
| `docker-compose-helper` | "Create a compose file with Nginx, Rails, Postgres, and Redis" |
| `docker-troubleshooting` | "My container exits with code 137 - what's wrong?" |
| `image-optimization` | "My Node image is 1.2 GB - help me shrink it" |
| `docker-resource-management` | "Set memory and CPU limits for my compose services" |
| `docker-networking` | "Two containers can't talk to each other - fix my networking" |
| `docker-volumes` | "Back up my Postgres data volume to a tar archive" |
| `docker-security` | "Audit my Dockerfile for security issues" |
| `docker-ci-cd` | "Build and push my image in GitHub Actions with layer caching" |
| `docker-registry` | "Set up a private registry with authentication" |
| `docker-development-env` | "Create a dev container with hot reload for my Go project" |
| `container-debugging` | "Show me the logs and processes inside my crashing container" |

---

## Roadmap

| Version | Theme | MCP Tools | Highlights |
|---|---|---|---|
| **v0.1.0** | Foundation | 10 | 12 skills, 6 rules, 10 read-only MCP tools |
| **v0.2.0** | Container Lifecycle | +10 | run, start, stop, restart, kill, rm, exec, pause |
| **v0.3.0** | Image and Build | +8 | pull, push, build, tag, rmi, commit, save, load |
| **v0.4.0** | Compose | +8 | up, down, ps, logs, build, restart, pull, exec |
| **v0.5.0** | Volumes, Networks, Cleanup | +12 | volume/network CRUD, system/container/image prune |
| **v0.6.0** | Advanced and Observability | +6 | cp, stats, top, events, update, wait |
| **v0.7.0** | Buildx and Multi-platform | +5 | Multi-arch builds, builder management |
| **v0.8.0** | Polish | +0 | Cross-references, pitfalls, documentation |
| **v1.0.0** | Stable | +0 | Production release, npm publish (~59 MCP tools) |

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Support

Found a bug or have a feature request? [Open an issue](https://github.com/TMHSDigital/Docker-Developer-Tools/issues).

---

## License

**CC-BY-NC-ND-4.0**

Copyright 2026 TM Hospitality Strategies. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built by <a href="https://github.com/TMHSDigital">TMHSDigital</a>
</p>
