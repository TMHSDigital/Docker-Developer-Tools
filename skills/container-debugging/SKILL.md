---
name: container-debugging
description: Debug running containers with log analysis, shell access, state inspection, and network diagnostics.
standards-version: 1.6.3
---

# Container Debugging

## Trigger

Use this skill when:
- A container is crashing, restarting, or stuck in a crash loop
- Application logs need analysis to find errors
- You need to inspect container state, environment, or mounts
- Network connectivity between containers is broken
- A container is being OOMKilled or running out of resources
- Files need to be copied into or out of a running container

## Required Inputs

- Container name or ID (use `docker_listContainers` to find it)
- Symptoms: crash loop, no response, wrong output, OOM, network failure
- Whether the container is running or already exited

## Workflow

1. **List containers** - call `docker_listContainers` to find the target and its current state.
2. **Read logs** - call `docker_containerLogs` to get recent output. Look for stack traces, connection errors, or permission denied messages.
3. **Inspect container** - call `docker_inspectContainer` to check environment variables, mounts, network settings, restart count, and exit code.
4. **Check for OOMKilled** - in the inspect output, look at `State.OOMKilled`. If true, the container ran out of memory.
5. **Shell into the container** - if the container is running, use `docker exec -it <container> sh` (or `bash` if available) to investigate interactively.
6. **Test network connectivity** - from inside the container, use `ping`, `curl`, `wget`, or `nslookup` to verify DNS and connectivity.
7. **Copy files for analysis** - use `docker cp` to pull log files, configs, or core dumps out of the container.
8. **Check resource usage** - use `docker stats` or `docker_diskUsage` to identify resource pressure.

## Key References

- [docker exec reference](https://docs.docker.com/reference/cli/docker/container/exec/)
- [docker logs reference](https://docs.docker.com/reference/cli/docker/container/logs/)
- [docker inspect reference](https://docs.docker.com/reference/cli/docker/inspect/)
- [docker cp reference](https://docs.docker.com/reference/cli/docker/container/cp/)
- [Debugging containers guide](https://docs.docker.com/config/containers/start-containers-automatically/)

## Example Interaction

**User:** My API container keeps restarting. How do I figure out why?

**Agent:** Let me check the container state and logs.

First, I'll call `docker_listContainers` to find the container. Then:

```bash
# Check the last 100 lines of logs
docker logs --tail 100 my-api

# Look at the container's exit code and restart count
docker inspect my-api --format '{{.RestartCount}} restarts, exit code {{.State.ExitCode}}, OOMKilled={{.State.OOMKilled}}'
```

Common causes by exit code:
- **Exit 0** - the process finished normally (check if your CMD is correct)
- **Exit 1** - application error (check logs for stack traces)
- **Exit 137** - killed by signal 9, usually OOMKilled or `docker kill`
- **Exit 139** - segfault (SIGSEGV)
- **Exit 143** - graceful shutdown (SIGTERM)

**User:** It's exit code 137 and OOMKilled is true.

**Agent:** The container is running out of memory. Options:

```bash
# Check current memory usage across all containers
docker stats --no-stream

# Increase the memory limit in compose
```

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

Or investigate the memory leak by shelling in:

```bash
docker exec -it my-api sh
# Inside the container:
cat /proc/meminfo
top -o %MEM
```

**User:** How do I debug network issues between containers?

**Agent:**

```bash
# Shell into the source container
docker exec -it my-api sh

# Test DNS resolution
nslookup db
# Expected: resolves to the db container's IP on the shared network

# Test TCP connectivity
wget -qO- http://db:5432 || echo "connection refused or timeout"

# If ping is available
ping -c 3 db

# Check what networks the container is on
docker inspect my-api --format '{{json .NetworkSettings.Networks}}' | python3 -m json.tool
```

If DNS fails, verify both containers are on the same Docker network. If you're using compose, they share a default network. If using standalone containers, connect them:

```bash
docker network connect my-network my-api
```

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_listContainers` | Find the target container and check its status (running, exited, restarting) |
| `docker_containerLogs` | Pull recent logs to find error messages and stack traces |
| `docker_inspectContainer` | Check exit code, OOMKilled flag, env vars, mounts, network config, restart count |
| `docker_listNetworks` | List Docker networks to verify containers share a network |
| `docker_listVolumes` | Verify volume mounts are present and pointing to the right paths |
| `docker_diskUsage` | Check if disk pressure is causing failures |
| `docker_systemInfo` | Check Docker engine version, total memory, and runtime configuration |

**Typical debugging flow with MCP:**
```
1. docker_listContainers - find the container, note its state
2. docker_containerLogs with containerId - read the error output
3. docker_inspectContainer with containerId - check:
   - State.ExitCode (why it stopped)
   - State.OOMKilled (memory issue)
   - State.RestartCount (how many times it restarted)
   - Mounts (are volumes attached correctly)
   - NetworkSettings.Networks (is it on the right network)
4. docker_listNetworks - verify network topology
```

**Copying files out for analysis:**
```bash
# Pull a log file from a stopped container
docker cp my-api:/app/logs/error.log ./error.log

# Pull the entire config directory
docker cp my-api:/app/config ./container-config/
```

## Common Pitfalls

- **Container has no shell** - distroless and scratch images have no shell. Use `docker cp` to extract files, or add a debug sidecar container that shares the same network/volumes.
- **Logs are gone after restart** - by default, Docker keeps logs, but with `--rm` containers they vanish. Use `docker_containerLogs` before the container is removed, or configure a logging driver that persists.
- **Wrong network** - containers on different Docker networks cannot reach each other by name. Use `docker_listNetworks` and `docker_inspectContainer` to verify.
- **Ignoring OOMKilled** - exit code 137 does not always mean OOM, but `State.OOMKilled: true` confirms it. Always check the inspect output, not just the exit code.
- **Using ping to test services** - ping tests ICMP, not TCP. A service can be unpingable but fully functional. Use `curl`, `wget`, or `nc` to test the actual port.
- **Assuming DNS works immediately** - container DNS resolution depends on the Docker daemon. If a dependent service just started, its DNS entry may not be available yet. Use healthchecks and retry logic.
- **Not checking restart count** - a container with `RestartCount: 50` is stuck in a crash loop. The logs from the most recent attempt may not show the root cause if earlier failures differ.
- **Debugging production containers with exec** - avoid installing tools in production images. Use ephemeral debug containers or `docker cp` to extract what you need.
- **Forgetting `--tail` on logs** - `docker logs` without `--tail` dumps the entire log history. For long-running containers this can be gigabytes. Always use `--tail 100` or `--since 5m`.

## See Also

- [Docker Compose Helper](../docker-compose-helper/SKILL.md)
- [Dockerfile Best Practices](../dockerfile-best-practices/SKILL.md)
- [Image Optimization](../image-optimization/SKILL.md)
