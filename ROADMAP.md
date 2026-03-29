# Roadmap

> Docker Developer Tools plugin roadmap. Versions follow semantic versioning.

## Current Status

**v0.1.0** - Foundation release with 12 skills, 6 rules, and 10 read-only MCP tools.

## Release Plan

| Version | Theme | Skills | Rules | MCP Tools | Status |
|---------|-------|--------|-------|-----------|--------|
| v0.1.0 | Foundation | 12 | 6 | 10 | (current) |
| v0.2.0 | Compose & Build | +2 | +1 | +4 | Planned |
| v0.3.0 | Container Ops | +1 | +0 | +4 | Planned |
| v0.4.0 | Advanced | +1 | +1 | +4 | Planned |
| v0.5.0 | Polish | +0 | +0 | +0 | Planned |
| v1.0.0 | Stable | +0 | +0 | +0 | Planned |

---

## v0.1.0 - Foundation

The initial release establishes the core plugin structure and essential Docker workflows.

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

## v0.2.0 - Compose & Build

Adds Docker Compose management and image build tools.

### MCP Tools
- `docker_composeStatus` - parse docker compose ps output
- `docker_composeConfig` - validate and show effective compose config
- `docker_buildImage` - build from Dockerfile with progress reporting
- `docker_tagImage` - tag an image for registry push

### Skills
- `docker-compose-advanced` - multi-environment compose, profiles, extensions
- `kubernetes-migration` - migrating from Docker Compose to Kubernetes manifests

### Rules
- `compose-security` - security-focused compose validation

---

## v0.3.0 - Container Ops

Adds container lifecycle management tools.

### MCP Tools
- `docker_startContainer` - start a stopped container
- `docker_stopContainer` - stop a running container
- `docker_removeContainer` - remove a container
- `docker_execCommand` - execute a command inside a running container

### Skills
- `docker-container-lifecycle` - container state management patterns

---

## v0.4.0 - Advanced

Adds maintenance, monitoring, and registry push tools.

### MCP Tools
- `docker_pruneSystem` - prune unused resources (images, containers, volumes, build cache)
- `docker_getContainerStats` - live resource usage (CPU, memory, network I/O)
- `docker_exportContainer` - export container filesystem as tar archive
- `docker_pushImage` - push image to a registry

### Skills
- `docker-monitoring` - production monitoring with Prometheus, cAdvisor, Grafana

### Rules
- `docker-logging` - logging driver and log rotation validation

---

## v0.5.0 - Polish

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
