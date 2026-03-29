# Roadmap

> Docker Developer Tools plugin roadmap. Versions follow semantic versioning.

## Current Status

**v0.1.0** - Foundation release with 12 skills, 6 rules, and 10 read-only MCP tools.

## Release Plan

| Version | Theme | New MCP Tools | Cumulative | Skills | Rules | Status |
|---------|-------|---------------|------------|--------|-------|--------|
| v0.1.0 | Foundation (read-only) | 10 | 10 | 12 | 6 | (current) |
| v0.2.0 | Container Lifecycle | +10 | 20 | +1 | +0 | Planned |
| v0.3.0 | Image and Build | +8 | 28 | +2 | +0 | Planned |
| v0.4.0 | Compose | +8 | 36 | +1 | +1 | Planned |
| v0.5.0 | Volumes, Networks, Cleanup | +12 | 48 | +0 | +0 | Planned |
| v0.6.0 | Advanced and Observability | +6 | 54 | +1 | +1 | Planned |
| v0.7.0 | Buildx and Multi-platform | +5 | 59 | +0 | +0 | Planned |
| v0.8.0 | Polish | +0 | 59 | +0 | +0 | Planned |
| v1.0.0 | Stable | +0 | 59 | +0 | +0 | Planned |

---

## v0.1.0 - Foundation

The initial release establishes the core plugin structure and essential Docker workflows. All MCP tools are read-only.

### MCP Tools (10)
- `docker_listContainers` - list running/all containers
- `docker_inspectContainer` - detailed container info
- `docker_containerLogs` - fetch container logs
- `docker_listImages` - list local images
- `docker_inspectImage` - detailed image metadata
- `docker_listVolumes` - list volumes
- `docker_listNetworks` - list networks
- `docker_systemInfo` - Docker system information
- `docker_diskUsage` - disk usage breakdown
- `docker_searchHub` - search Docker Hub

### Skills (12)
- `dockerfile-best-practices` - writing and optimizing Dockerfiles
- `docker-compose-helper` - compose file creation and debugging
- `container-debugging` - debugging running containers
- `image-optimization` - reducing image sizes
- `docker-networking` - container networking configuration
- `docker-volumes` - data persistence and volume management
- `docker-security` - container security hardening
- `docker-ci-cd` - Docker in CI/CD pipelines
- `docker-registry` - container registry workflows
- `docker-troubleshooting` - common problem diagnosis
- `docker-development-env` - development environments with Docker
- `docker-resource-management` - resource limits and monitoring

### Rules (6)
- `dockerfile-lint` - Dockerfile antipattern detection
- `docker-secrets` - credential safety (global)
- `compose-validation` - compose file validation
- `docker-resource-limits` - missing resource limit detection
- `docker-image-pinning` - unpinned tag detection
- `docker-port-conflicts` - port conflict detection

---

## v0.2.0 - Container Lifecycle

The plugin gains the ability to act. Full container lifecycle management from creation through removal.

### MCP Tools (+10)
- `docker_run` - create and start a container from an image (ports, env, mounts, name, detach)
- `docker_create` - create a container without starting it
- `docker_start` - start one or more stopped containers
- `docker_stop` - stop running containers (with optional grace period)
- `docker_restart` - restart one or more containers
- `docker_kill` - send a signal to running containers
- `docker_rm` - remove one or more containers
- `docker_pause` - pause all processes in a container
- `docker_unpause` - unpause a paused container
- `docker_exec` - run a command in a running container

### Skills
- `docker-container-lifecycle` - container state management patterns

---

## v0.3.0 - Image and Build

Complete image pipeline from pulling to building to pushing to cleanup.

### MCP Tools (+8)
- `docker_pull` - pull an image or repository from a registry
- `docker_push` - push an image to a registry
- `docker_build` - build an image from a Dockerfile and context
- `docker_tag` - tag an image with a new name/tag
- `docker_rmi` - remove one or more images
- `docker_commit` - create a new image from a container's changes
- `docker_save` - save images to a tar archive
- `docker_load` - load images from a tar archive

### Skills
- `docker-compose-advanced` - multi-environment compose, profiles, extensions
- `kubernetes-migration` - migrating from Docker Compose to Kubernetes manifests

---

## v0.4.0 - Compose

Full Docker Compose V2 management. Create, control, and tear down multi-service stacks.

### MCP Tools (+8)
- `docker_composeUp` - create and start compose services (build, detach, profiles)
- `docker_composeDown` - stop and remove containers, networks, and optionally volumes/images
- `docker_composePs` - list containers for a compose project
- `docker_composeLogs` - view and follow logs for compose services
- `docker_composeBuild` - build or rebuild compose service images
- `docker_composeRestart` - restart compose services
- `docker_composePull` - pull images for compose services
- `docker_composeExec` - execute a command in a running compose service container

### Skills
- `docker-monitoring` - production monitoring with Prometheus, cAdvisor, Grafana

### Rules
- `compose-security` - security-focused compose validation

---

## v0.5.0 - Volumes, Networks, Cleanup

Infrastructure management and resource cleanup. Create, inspect, connect, and prune volumes, networks, and system resources.

### MCP Tools (+12)
- `docker_volumeCreate` - create a named volume with optional driver and labels
- `docker_volumeRm` - remove one or more volumes
- `docker_volumeInspect` - display detailed volume information
- `docker_volumePrune` - remove all unused local volumes
- `docker_networkCreate` - create a network (bridge, overlay, macvlan)
- `docker_networkRm` - remove one or more networks
- `docker_networkConnect` - connect a container to a network
- `docker_networkDisconnect` - disconnect a container from a network
- `docker_networkInspect` - display detailed network information
- `docker_networkPrune` - remove all unused networks
- `docker_systemPrune` - remove unused containers, networks, images, and optionally volumes
- `docker_containerPrune` - remove all stopped containers
- `docker_imagePrune` - remove dangling or unused images

---

## v0.6.0 - Advanced and Observability

File transfer, live monitoring, and container runtime updates.

### MCP Tools (+6)
- `docker_cp` - copy files or directories between a container and local filesystem
- `docker_stats` - live resource usage (CPU, memory, network I/O)
- `docker_top` - show running processes in a container
- `docker_events` - stream real-time events from the Docker daemon
- `docker_update` - update container resource configuration (CPU, memory, restart policy)
- `docker_wait` - block until a container stops and return its exit code

### Skills
- `docker-advanced-workflows` - multi-stage pipelines, sidecar patterns, health checks

### Rules
- `docker-logging` - logging driver and log rotation validation

---

## v0.7.0 - Buildx and Multi-platform

Extended build capabilities for multi-architecture images and builder management.

### MCP Tools (+5)
- `docker_buildxBuild` - multi-platform builds with cache export and provenance
- `docker_buildxLs` - list builder instances
- `docker_buildxCreate` - create a new builder instance
- `docker_buildxRm` - remove a builder instance
- `docker_builderPrune` - remove build cache

---

## v0.8.0 - Polish

Focuses on cross-referencing, common pitfalls, and documentation completeness.

- Expand Common Pitfalls sections across all skills
- Add cross-references between related skills and rules
- Improve MCP Usage sections with more detailed examples
- Add workflow diagrams to complex skills
- Comprehensive error message review for all MCP tools

---

## v1.0.0 - Stable

Production release after community feedback and testing.

- Finalize all APIs and tool signatures
- Complete documentation coverage
- Performance optimization for MCP tool responses
- Publish `@tmhs/docker-mcp` to npm registry
- Full test coverage across all components

---

## Safety Considerations

All destructive MCP tools (`rm`, `rmi`, `prune`, `kill`, `down`) will:

- Default to **dry-run** where Docker supports it (`--dry-run` on prune and compose commands)
- Require explicit identifiers - no blanket wildcards or "remove all" without a filter
- Return clear confirmation of what was affected in the response
- Never force-remove by default - `force` must be explicitly opted in

---

## Completed

- [x] Plugin scaffold (plugin.json, directory structure)
- [x] MCP server with 10 read-only tools
- [x] 12 skills covering core Docker workflows
- [x] 6 rules for Dockerfile and compose validation
- [x] Python test suite for structure validation
- [x] Vitest test suite for MCP server
- [x] GitHub Actions CI/CD workflows
- [x] GitHub Pages landing site
- [x] Contributing guide and issue templates

---

## Contributing

Have an idea for a new skill, rule, or MCP tool? Check the [Contributing Guide](CONTRIBUTING.md) and open an issue or pull request.
