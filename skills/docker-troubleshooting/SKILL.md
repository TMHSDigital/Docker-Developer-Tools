---
name: docker-troubleshooting
description: Diagnose and fix common Docker problems including port conflicts, permission errors, disk space, networking issues, and build failures.
standards-version: 1.6.3
---

# Docker Troubleshooting

## Trigger

Use this skill when:
- A container fails to start or exits immediately
- Port binding errors occur (address already in use)
- Permission denied errors on the Docker socket or inside containers
- Docker runs out of disk space
- Image pulls fail with auth or network errors
- DNS resolution fails inside containers
- Build context is unexpectedly large or builds fail
- Docker Compose services fail dependency checks
- The Docker daemon won't start or is unresponsive
- Containers can't communicate across networks

## Required Inputs

- Error message or symptom description
- `docker logs` output from the failing container (if applicable)
- OS and Docker version (`docker version`)
- Whether running Docker Desktop, Docker Engine, or rootless mode
- Compose file if using Docker Compose

## Workflow

1. **Identify the symptom** - categorize the problem (startup failure, networking, disk, permissions, build).
2. **Gather diagnostics** - collect logs, inspect containers, check system state.
3. **Isolate the cause** - use targeted commands to narrow down the root cause.
4. **Apply the fix** - make the minimal change needed to resolve the issue.
5. **Verify the fix** - confirm the container or build works as expected.
6. **Prevent recurrence** - add monitoring, `.dockerignore`, health checks, or resource limits.

## Key References

- [Docker troubleshooting guide](https://docs.docker.com/engine/daemon/troubleshoot/)
- [Docker Desktop troubleshooting](https://docs.docker.com/desktop/troubleshoot-and-support/troubleshoot/)
- [Docker logs reference](https://docs.docker.com/reference/cli/docker/container/logs/)
- [Docker system prune](https://docs.docker.com/reference/cli/docker/system/prune/)
- [Networking troubleshooting](https://docs.docker.com/engine/network/troubleshoot/)

## Example Interaction

**User:** I get "port is already allocated" when starting a container.

**Agent:** Something else is using that port. Find and stop it:

```bash
# Find what's using port 3000 (Linux/macOS)
lsof -i :3000
# or
ss -tlnp | grep 3000

# On Windows PowerShell
netstat -ano | findstr :3000
# Then identify the PID and kill it
taskkill /PID <pid> /F
```

Or check if a stopped Docker container still holds the port:

```bash
# List all containers including stopped ones
docker ps -a --filter "publish=3000"

# Remove the stopped container holding the port
docker rm <container_id>
```

If you just need a different port, remap it:

```bash
docker run -d -p 3001:3000 my-app:latest
```

**User:** I get "permission denied" trying to run Docker commands.

**Agent:** This usually means your user isn't in the `docker` group:

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Apply the change (log out and back in, or use newgrp)
newgrp docker

# Verify
docker ps
```

If you get permission denied on files inside the container, it's a UID mismatch between the host and container user:

```bash
# Check what user the container runs as
docker inspect --format '{{.Config.User}}' my-container

# Fix ownership on bind-mounted directories
sudo chown -R 1000:1000 ./app-data

# Or run the container with your host UID
docker run -u "$(id -u):$(id -g)" -v ./data:/data my-app:latest
```

**User:** Docker is eating all my disk space.

**Agent:** Check what's consuming space, then prune:

```bash
# See disk usage breakdown
docker system df
docker system df -v  # verbose, per-image/container/volume

# Remove unused data (stopped containers, dangling images, unused networks)
docker system prune

# Nuclear option - remove everything unused including named volumes
docker system prune -a --volumes
```

For targeted cleanup:

```bash
# Remove dangling images only
docker image prune

# Remove all unused images (not just dangling)
docker image prune -a

# Remove stopped containers
docker container prune

# Remove unused volumes (careful - data loss)
docker volume prune

# Remove build cache
docker builder prune
docker builder prune -a  # remove all build cache
```

Set up automatic cleanup in cron or a scheduled task:

```bash
# Weekly cleanup of images older than 7 days
0 3 * * 0 docker image prune -a --filter "until=168h" -f
```

**User:** My container starts and immediately exits.

**Agent:** Check the exit code and logs:

```bash
# See the exit code
docker ps -a --filter "name=my-container" --format "{{.Status}}"

# Get the logs
docker logs my-container

# If the container was removed, run interactively to see the error
docker run -it my-app:latest
```

Common exit codes:
- **Exit 0** - the process finished successfully. Your CMD probably isn't a long-running process. Use `tail -f /dev/null` for debugging or fix the entrypoint.
- **Exit 1** - application error. Check the logs.
- **Exit 127** - command not found. The binary in CMD/ENTRYPOINT doesn't exist in the image.
- **Exit 137** - killed by OOM (out of memory). Increase memory limit or fix a memory leak.
- **Exit 139** - segfault. A native binary crashed.

```bash
# Debug by overriding the entrypoint
docker run -it --entrypoint /bin/sh my-app:latest

# Check if the binary exists
which node  # or whatever your CMD uses

# Check if config files are present
ls -la /app/
```

**User:** My build context is huge and builds are slow.

**Agent:** Docker sends the entire build directory to the daemon. Add a `.dockerignore`:

```text
# .dockerignore
node_modules
.git
.env
*.log
dist
coverage
.next
__pycache__
*.pyc
.venv
```

Check the context size:

```bash
# See what Docker is sending
docker build --no-cache -t test . 2>&1 | head -5
# "Sending build context to Docker daemon  1.2GB" means trouble

# Find large files in the build directory
du -sh * | sort -rh | head -20
```

**User:** DNS doesn't work inside my containers.

**Agent:** Test DNS resolution inside the container:

```bash
docker run --rm alpine nslookup google.com
docker run --rm alpine ping -c 2 google.com
```

If it fails, try these fixes in order:

```bash
# 1. Use Google DNS explicitly
docker run --dns 8.8.8.8 --rm alpine nslookup google.com

# 2. Check Docker daemon DNS settings
docker info | grep -i dns

# 3. Configure daemon DNS permanently in /etc/docker/daemon.json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
# Then restart Docker: sudo systemctl restart docker
```

On Docker Desktop for Windows/macOS, DNS issues can be caused by VPN software. Try restarting Docker Desktop or switching the network mode.

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_containerLogs` | Get logs from a failing container without shell access |
| `docker_inspectContainer` | Check exit code, state, config, mounts, and network settings |
| `docker_listContainers` | Find stopped/crashed containers and their statuses |
| `docker_inspectImage` | Verify entrypoint, cmd, user, and exposed ports |
| `docker_listNetworks` | Check network configuration when containers can't communicate |
| `docker_diskUsage` | Identify what's consuming disk space |
| `docker_systemInfo` | Check daemon status, driver, and runtime configuration |
| `docker_listVolumes` | Find orphaned volumes consuming disk space |

**Diagnosing a crashed container:**
```
1. docker_listContainers (all=true) - find the container and its status
2. docker_containerLogs - read the error output
3. docker_inspectContainer - check:
   - State.ExitCode (137=OOM, 127=missing binary, 1=app error)
   - State.OOMKilled (true if out of memory)
   - HostConfig.Memory (check if limits are too low)
   - Config.Cmd and Config.Entrypoint (verify command is correct)
   - Mounts (verify bind mounts exist on host)
4. docker_inspectImage - verify the image has the expected CMD
```

**Diagnosing networking issues:**
```
1. docker_listNetworks - check which networks exist
2. docker_inspectContainer on both containers - verify:
   - NetworkSettings.Networks (are they on the same network?)
   - NetworkSettings.IPAddress (can they reach each other?)
3. docker_systemInfo - check if the network driver is working
```

## Common Pitfalls

- **Checking running containers only** - `docker ps` hides stopped containers. Always use `docker ps -a` or pass `all=true` to `docker_listContainers`.
- **Ignoring the exit code** - the exit code tells you the category of failure. Always check it before diving into logs.
- **Pruning volumes without checking** - `docker volume prune` deletes data permanently. List volumes and inspect them first.
- **Binding to 0.0.0.0 unintentionally** - `-p 3000:3000` binds on all interfaces. Use `-p 127.0.0.1:3000:3000` for local-only access.
- **VPN breaking Docker networking** - VPNs often override DNS and routing. Try disconnecting the VPN to confirm it's the cause.
- **WSL2 memory ballooning** - Docker Desktop on Windows uses WSL2, which can consume unbounded memory. Add a `.wslconfig` file to limit it:

```ini
# %USERPROFILE%\.wslconfig
[wsl2]
memory=4GB
processors=2
```

- **Compose service names as hostnames** - in Docker Compose, services reach each other by service name (not container name). `db`, not `my-project-db-1`.
- **Stale containers blocking port allocation** - a container in "Created" or "Exited" state can still hold a port if it wasn't properly cleaned up. Remove it with `docker rm`.
- **Build cache causing stale results** - if a `COPY` layer hasn't changed but the file contents have, try `docker build --no-cache` to rule out cache issues.
- **ARM vs x86 image mismatch** - on Apple Silicon Macs, pulling an amd64 image runs under emulation and may fail or be slow. Use `--platform linux/arm64` or multi-arch images.
- **Docker Desktop needing a restart** - many Docker Desktop issues are resolved by restarting the application or resetting the Docker engine to factory defaults.

## See Also

- [Container Debugging](../container-debugging/SKILL.md)
- [Docker Networking](../docker-networking/SKILL.md)
- [Docker Resource Management](../docker-resource-management/SKILL.md)
- [Docker Volumes](../docker-volumes/SKILL.md)
