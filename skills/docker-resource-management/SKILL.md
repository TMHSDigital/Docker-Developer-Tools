---
name: docker-resource-management
description: Configure resource limits and monitoring with CPU and memory constraints, cgroups, container stats, and OOM kill prevention.
standards-version: 1.6.3
---

# Docker Resource Management

## Trigger

Use this skill when:
- Setting memory or CPU limits on containers
- Diagnosing OOM (out of memory) kills
- Monitoring container resource usage with `docker stats`
- Configuring resource constraints in Docker Compose
- Understanding cgroup v1 vs v2 behavior
- Setting up Prometheus or cAdvisor for container monitoring
- Tuning swap and memory reservation settings
- Preventing a single container from starving others

## Required Inputs

- Application type and expected resource profile (CPU-bound, memory-bound, I/O-bound)
- Deployment target (local dev, Docker Compose, Swarm, Kubernetes)
- Host system resources (total RAM, CPU cores)
- Whether the app is JVM-based, Node.js, Python, Go, etc. (affects memory behavior)

## Workflow

1. **Baseline resource usage** - run the container without limits and observe with `docker stats`.
2. **Set memory limits** - use `--memory` to cap memory and `--memory-reservation` for soft limits.
3. **Set CPU limits** - use `--cpus` for fractional CPU limits or `--cpu-shares` for relative weighting.
4. **Configure swap** - set `--memory-swap` to control how much swap the container can use.
5. **Test under load** - stress test and monitor for OOM kills, CPU throttling, or performance degradation.
6. **Set up monitoring** - deploy Prometheus with cAdvisor for ongoing resource visibility.
7. **Tune and iterate** - adjust limits based on observed behavior under realistic workloads.

## Key References

- [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/)
- [docker stats reference](https://docs.docker.com/reference/cli/docker/container/stats/)
- [Cgroup v2 documentation](https://docs.docker.com/engine/containers/runmetrics/)
- [Compose deploy resources](https://docs.docker.com/compose/how-tos/resource-constraints/)
- [cAdvisor](https://github.com/google/cadvisor)
- [Prometheus Docker monitoring](https://prometheus.io/docs/guides/cadvisor/)

## Example Interaction

**User:** How do I set memory and CPU limits on a container?

**Agent:**

```bash
# Limit to 512MB RAM and 0.5 CPU cores
docker run -d --name my-api \
  --memory 512m \
  --cpus 0.5 \
  my-api:latest

# With memory reservation (soft limit) and swap
docker run -d --name my-api \
  --memory 512m \
  --memory-reservation 256m \
  --memory-swap 768m \
  --cpus 1.5 \
  my-api:latest
```

Breakdown:
- `--memory 512m` - hard limit. Container is killed if it exceeds this.
- `--memory-reservation 256m` - soft limit. Docker tries to keep the container under this when the host is under memory pressure.
- `--memory-swap 768m` - total memory + swap. Swap available = 768m - 512m = 256m of swap.
- `--cpus 1.5` - can use up to 1.5 CPU cores (150% of one core).

**User:** How do I set limits in Docker Compose?

**Agent:** Use the `deploy.resources` section (Compose v3+) or top-level resource keys:

```yaml
services:
  api:
    image: my-api:latest
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 128M
```

For Compose v2 format (also works in v3 with `docker compose` CLI):

```yaml
services:
  api:
    image: my-api:latest
    mem_limit: 512m
    mem_reservation: 128m
    cpus: 1.0
```

Both formats work with `docker compose up`. The `deploy` section is also used by Docker Swarm.

**User:** My container keeps getting OOM killed. How do I debug this?

**Agent:** First, confirm it was an OOM kill:

```bash
# Check if the container was OOM killed
docker inspect my-api --format '{{.State.OOMKilled}}'
# true = killed by the OOM killer

# Check the exit code (137 = SIGKILL, typical of OOM)
docker inspect my-api --format '{{.State.ExitCode}}'
```

Then investigate memory usage:

```bash
# Watch real-time memory usage
docker stats my-api --no-stream

# Check the memory limit
docker inspect my-api --format '{{.HostConfig.Memory}}'

# Check memory usage at the cgroup level (Linux)
cat /sys/fs/cgroup/docker/<container_id>/memory.current  # cgroup v2
cat /sys/fs/cgroup/memory/docker/<container_id>/memory.usage_in_bytes  # cgroup v1
```

Common fixes:
- **Increase the limit** if it's genuinely too low for the workload
- **Fix memory leaks** - use profiling tools specific to your language
- **Tune garbage collection** - JVM: set `-Xmx` below the container limit. Node.js: set `--max-old-space-size`
- **Add swap** as a buffer: `--memory-swap` to twice the memory limit

For JVM applications, the container-aware JVM flags:

```bash
docker run -d --memory 512m \
  -e JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseContainerSupport" \
  my-java-app:latest
```

For Node.js:

```bash
docker run -d --memory 512m \
  -e NODE_OPTIONS="--max-old-space-size=384" \
  my-node-app:latest
```

**User:** How do I monitor container resources with Prometheus?

**Agent:** Deploy cAdvisor alongside Prometheus:

```yaml
# docker-compose.monitoring.yml
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - promdata:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafanadata:/var/lib/grafana
    restart: unless-stopped

volumes:
  promdata:
  grafanadata:
```

Prometheus config:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: cadvisor
    static_configs:
      - targets: ["cadvisor:8080"]
```

Useful PromQL queries for container monitoring:

```promql
# Memory usage per container
container_memory_usage_bytes{name=~".+"}

# CPU usage rate per container
rate(container_cpu_usage_seconds_total{name=~".+"}[5m])

# Memory usage as percentage of limit
container_memory_usage_bytes / container_spec_memory_limit_bytes * 100

# Containers near their memory limit (over 80%)
container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.8
```

**User:** What's the difference between cgroup v1 and v2?

**Agent:** Key differences that affect container resource management:

| Feature | cgroup v1 | cgroup v2 |
|---------|-----------|-----------|
| Hierarchy | Separate trees per controller | Unified single tree |
| Memory accounting | `memory.usage_in_bytes` | `memory.current` |
| OOM control | `memory.oom_control` | `memory.oom.group` |
| PSI (pressure stall info) | Not available | `cpu.pressure`, `memory.pressure` |
| Default on | Older Linux (pre-2022) | Ubuntu 22.04+, Fedora 31+, RHEL 9+ |

Check which version your system uses:

```bash
# Check cgroup version
stat -fc %T /sys/fs/cgroup/
# "cgroup2fs" = v2
# "tmpfs" = v1
```

Docker Desktop uses cgroup v2 by default on recent versions.

**User:** How do I use `docker stats` effectively?

**Agent:**

```bash
# Live stats for all containers
docker stats

# One-time snapshot (no stream)
docker stats --no-stream

# Specific containers
docker stats api db redis

# Custom format for scripting
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}"

# JSON output for parsing
docker stats --no-stream --format '{{json .}}'
```

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_inspectContainer` | Check memory/CPU limits, OOM kill status, and cgroup settings |
| `docker_listContainers` | List all containers with their current status and resource state |
| `docker_containerLogs` | Check for OOM-related errors or resource exhaustion messages |
| `docker_systemInfo` | Check cgroup version, total memory, CPUs, and runtime config |
| `docker_diskUsage` | Monitor overall Docker resource consumption |

**Diagnosing OOM kills with MCP:**
```
1. docker_listContainers (all=true) - find containers with "Exited (137)" status
2. docker_inspectContainer - check:
   - State.OOMKilled (true if killed by OOM)
   - State.ExitCode (137 = SIGKILL)
   - HostConfig.Memory (the configured limit)
   - HostConfig.MemorySwap (swap limit)
   - HostConfig.MemoryReservation (soft limit)
3. docker_containerLogs - look for memory-related errors before the kill
4. docker_systemInfo - check host total memory and cgroup driver
```

**Resource audit workflow:**
```
1. docker_listContainers - get all running containers
2. docker_inspectContainer on each - check:
   - HostConfig.Memory (0 means no limit - risky in production)
   - HostConfig.NanoCpus (0 means no CPU limit)
   - HostConfig.PidsLimit (0 or -1 means unlimited PIDs)
3. Flag any container without resource limits as a risk
4. docker_systemInfo - compare against total host resources
```

## Common Pitfalls

- **No memory limit = unlimited** - by default, a container can use all host memory. Always set `--memory` in production to prevent one container from starving others.
- **JVM ignoring container limits** - older JVMs (pre-Java 10) don't respect cgroup memory limits. Use `-XX:+UseContainerSupport` (default in Java 10+) and set `-XX:MaxRAMPercentage` instead of `-Xmx` with a hardcoded value.
- **Setting memory-swap equal to memory** - `--memory-swap 512m --memory 512m` means zero swap (swap = memory-swap minus memory). To disable swap entirely, use `--memory-swap` equal to `--memory`. To allow some swap, set `--memory-swap` higher.
- **CPU shares vs CPU limits** - `--cpu-shares` is relative weighting (only matters under contention). `--cpus` is an absolute limit. Use `--cpus` when you need a hard cap.
- **Not accounting for kernel overhead** - the memory limit includes the kernel's page cache and buffer usage for the container. Your application may OOM even if its heap is below the limit.
- **Ignoring memory reservation** - `--memory-reservation` is a soft limit. Under host memory pressure, Docker reclaims memory from containers exceeding their reservation first. Set it to help prioritize important containers.
- **Stats showing 0% CPU** - `docker stats` shows CPU as a percentage of all host cores. A single-threaded app on a 16-core host maxes out at 6.25%, not 100%.
- **cAdvisor on cgroup v2** - older cAdvisor versions don't fully support cgroup v2. Use version 0.47+ for proper cgroup v2 metrics.
- **OOM kills without logs** - the Linux OOM killer terminates the process instantly. The container's application logs won't show a graceful shutdown. Check `docker inspect` for `State.OOMKilled` and `dmesg` for kernel OOM messages.
- **Compose deploy section ignored** - the `deploy` section is ignored by `docker compose up` unless using `--compatibility` flag or Docker Swarm. Use top-level `mem_limit`/`cpus` keys for `docker compose up`.

## See Also

- [Docker Troubleshooting](../docker-troubleshooting/SKILL.md)
- [Container Debugging](../container-debugging/SKILL.md)
- [Docker Security](../docker-security/SKILL.md)
- [Docker Compose Helper](../docker-compose-helper/SKILL.md)
