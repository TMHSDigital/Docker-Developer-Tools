---
name: docker-volumes
description: Manage data persistence with named volumes, bind mounts, tmpfs mounts, volume drivers, and backup strategies.
standards-version: 1.6.3
---

# Docker Volumes

## Trigger

Use this skill when:
- Persisting data across container restarts or recreations
- Choosing between named volumes, bind mounts, and tmpfs
- Backing up or restoring volume data
- Debugging permission issues with mounted directories
- Sharing data between multiple containers
- Extracting files from containers with `docker cp`
- Managing volume lifecycle (create, inspect, prune)

## Required Inputs

- Type of data being persisted (database, uploads, config, logs)
- Whether the data needs to survive container removal
- Host OS (Linux, macOS, Windows) for permission considerations
- Whether multiple containers need concurrent access

## Workflow

1. **Choose the mount type** - named volumes for managed persistence, bind mounts for host directory sharing, tmpfs for sensitive in-memory data.
2. **Create named volumes** - use `docker volume create` with optional labels for organization.
3. **Mount volumes in containers** - use `-v` or `--mount` syntax. Prefer `--mount` for clarity.
4. **Set permissions** - match container UID/GID to volume ownership. Use `chown` in the Dockerfile or entrypoint.
5. **Share between containers** - mount the same named volume in multiple containers with appropriate read/write flags.
6. **Back up volumes** - use a helper container to tar the volume contents to the host.
7. **Inspect and clean up** - use `docker_listVolumes` to find volumes, `docker volume prune` to remove unused ones.

## Key References

- [Docker volumes overview](https://docs.docker.com/storage/volumes/)
- [Bind mounts](https://docs.docker.com/storage/bind-mounts/)
- [tmpfs mounts](https://docs.docker.com/storage/tmpfs/)
- [Volume drivers and plugins](https://docs.docker.com/engine/extend/plugins_volume/)
- [docker cp reference](https://docs.docker.com/reference/cli/docker/container/cp/)

## Example Interaction

**User:** What's the difference between named volumes and bind mounts?

**Agent:**

| Feature | Named Volume | Bind Mount |
|---------|-------------|------------|
| Managed by Docker | Yes | No |
| Location | `/var/lib/docker/volumes/` | Anywhere on host |
| Created on the fly | Yes | Must exist on host |
| Works on all OSes | Yes | Path format varies |
| Ownership | Docker managed | Host UID/GID |
| Best for | Databases, persistent data | Source code, configs |
| Performance on macOS | Excellent | Slow (virtualized FS) |

```bash
# Named volume
docker run -d --name db \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

# Bind mount (host directory)
docker run -d --name api \
  -v "$(pwd)/src:/app/src" \
  my-api:latest

# tmpfs (in-memory, never written to disk)
docker run -d --name cache \
  --tmpfs /tmp:rw,noexec,size=100m \
  my-app:latest
```

**User:** How do I back up a Docker volume?

**Agent:** Use a temporary container to mount the volume and tar it:

```bash
# Back up volume "pgdata" to a tar file on the host
docker run --rm \
  -v pgdata:/source:ro \
  -v "$(pwd):/backup" \
  alpine tar czf /backup/pgdata-backup.tar.gz -C /source .

# Restore into a new or existing volume
docker volume create pgdata-restored
docker run --rm \
  -v pgdata-restored:/target \
  -v "$(pwd):/backup:ro" \
  alpine sh -c "tar xzf /backup/pgdata-backup.tar.gz -C /target"
```

**User:** My container can't write to the mounted volume. Permission denied.

**Agent:** This is a UID/GID mismatch. The container process runs as one user, but the volume directory is owned by another.

```bash
# Check what user the container runs as
docker exec my-app id
# uid=1000(appuser) gid=1000(appgroup)

# Check volume ownership
docker exec my-app ls -la /data
# drwxr-xr-x 2 root root 4096 ...

# Fix in the Dockerfile - set ownership during build
```

```dockerfile
FROM node:20-alpine
RUN addgroup -S app && adduser -S app -G app
RUN mkdir -p /data && chown app:app /data
VOLUME /data
USER app
```

Or fix at runtime with an entrypoint script:

```bash
#!/bin/sh
# entrypoint.sh - fix permissions then exec the main process
chown -R app:app /data
exec su-exec app "$@"
```

**User:** How do I copy a file out of a running container?

**Agent:**

```bash
# Copy a single file from container to host
docker cp my-api:/app/config.json ./config.json

# Copy a directory
docker cp my-api:/app/logs ./container-logs/

# Copy from host into a running container
docker cp ./new-config.json my-api:/app/config.json
```

This works on both running and stopped containers.

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_listVolumes` | List all volumes, their drivers, and labels |
| `docker_inspectContainer` | Check volume mounts - source, destination, read/write mode |
| `docker_listContainers` | Find which containers have volumes attached |
| `docker_diskUsage` | See total disk used by volumes vs images vs containers |
| `docker_systemInfo` | Check available volume drivers and storage driver |

**Checking volume usage and mounts:**
```
1. docker_listVolumes - see all volumes and which driver they use
2. docker_diskUsage - check how much space volumes consume
3. docker_inspectContainer - verify a container's Mounts array:
   - Type (volume, bind, tmpfs)
   - Source (volume name or host path)
   - Destination (path inside container)
   - RW (read-write or read-only)
```

**Finding orphaned volumes:**
```bash
# List volumes not referenced by any container
docker volume ls -f dangling=true

# Remove all unused volumes (confirm first via docker_listVolumes)
docker volume prune
```

## Common Pitfalls

- **Bind mount performance on macOS** - the macOS Docker VM virtualizes file I/O. Bind-mounted directories can be 5-10x slower than native. Use named volumes for databases and node_modules.
- **Volume data owned by root** - named volumes are created as root by default. If your container runs as non-root, it can't write. Set ownership in the Dockerfile or entrypoint.
- **Accidentally deleting volumes with `docker system prune -a --volumes`** - the `--volumes` flag removes all unused volumes. Database data can be permanently lost. Always back up first.
- **Using `-v /host/path:/container/path` with relative paths** - bind mounts require absolute paths. Relative paths are interpreted as named volumes. Use `$(pwd)/path` or `--mount type=bind,source=./path,...`.
- **Forgetting `:ro` for read-only mounts** - config files and secrets should be mounted read-only (`-v config.json:/app/config.json:ro`) to prevent accidental writes.
- **Volume driver not installed** - remote volume drivers (NFS, CIFS, cloud storage) must be installed as plugins. Check `docker_systemInfo` for available drivers.
- **Overwriting volume data on first run** - if a named volume is empty and the image has data at the mount point, Docker copies the image data into the volume. On subsequent runs, the volume data takes precedence. This only works with named volumes, not bind mounts.
- **Mixing VOLUME instruction with bind mounts** - `VOLUME` in a Dockerfile creates an anonymous volume if no explicit mount is provided. This can lead to data stored in unexpected anonymous volumes. Be explicit with `-v` at runtime instead.
- **Not pruning dangling volumes** - every `docker run -v /some/path` without a named volume creates an anonymous volume. These accumulate silently. Run `docker volume prune` periodically.
- **tmpfs not persisting data** - tmpfs mounts exist only in memory and vanish when the container stops. Never use tmpfs for data you need to keep.

## See Also

- [Docker Networking](../docker-networking/SKILL.md)
- [Container Debugging](../container-debugging/SKILL.md)
- [Docker Security](../docker-security/SKILL.md)
- [Dockerfile Best Practices](../dockerfile-best-practices/SKILL.md)
