---
name: docker-networking
description: Configure container networking with bridge, host, and overlay drivers, port mapping, DNS resolution, and inter-container communication.
standards-version: 1.6.3
---

# Docker Networking

## Trigger

Use this skill when:
- Creating custom Docker networks for multi-container apps
- Configuring port mapping between host and container
- Troubleshooting DNS resolution between containers
- Choosing between bridge, host, overlay, or macvlan drivers
- Setting up network aliases for service discovery
- Isolating containers on separate networks for security
- Debugging connectivity failures between containers

## Required Inputs

- Network driver needed (bridge, host, overlay, macvlan)
- Containers or services that need to communicate
- Port mapping requirements (host:container)
- Whether running single-host or multi-host (Swarm/K8s)

## Workflow

1. **Choose the right driver** - bridge for single-host isolation, host for max performance (no NAT), overlay for multi-host Swarm, macvlan for direct L2 access.
2. **Create a custom network** - avoid the default bridge network; it lacks automatic DNS and has weaker isolation.
3. **Configure port mapping** - use `-p hostPort:containerPort` or `-p 127.0.0.1:hostPort:containerPort` to bind to a specific interface.
4. **Assign network aliases** - give containers discoverable names beyond their container name using `--network-alias`.
5. **Connect containers to networks** - attach running containers to additional networks with `docker network connect`.
6. **Test connectivity** - use `docker exec` to run `nslookup`, `curl`, or `nc` between containers.
7. **Inspect and verify** - use `docker_listNetworks` and `docker_inspectContainer` to confirm network topology.

## Key References

- [Docker networking overview](https://docs.docker.com/network/)
- [Bridge network driver](https://docs.docker.com/network/drivers/bridge/)
- [Overlay network driver](https://docs.docker.com/network/drivers/overlay/)
- [Macvlan network driver](https://docs.docker.com/network/drivers/macvlan/)
- [Host network driver](https://docs.docker.com/network/drivers/host/)

## Example Interaction

**User:** I have a Node.js API and a PostgreSQL database running as separate containers. They can't talk to each other.

**Agent:** They're probably on the default bridge network, which doesn't provide automatic DNS resolution. Create a custom bridge network:

```bash
# Create a custom network
docker network create app-net

# Run the database on the custom network
docker run -d --name db --network app-net \
  -e POSTGRES_PASSWORD=secret \
  postgres:16-alpine

# Run the API on the same network
docker run -d --name api --network app-net \
  -e DATABASE_URL=postgresql://postgres:secret@db:5432/mydb \
  -p 3000:3000 \
  my-api:latest
```

Now the API can resolve `db` by name because custom bridge networks include an embedded DNS server.

**User:** What if I need the database accessible from two different app networks?

**Agent:** Connect the database container to both networks:

```bash
docker network create frontend-net
docker network create backend-net

# Start db on backend-net
docker run -d --name db --network backend-net \
  -e POSTGRES_PASSWORD=secret \
  postgres:16-alpine

# Also connect db to frontend-net
docker network connect frontend-net db

# Verify it's on both networks
docker inspect db --format '{{json .NetworkSettings.Networks}}' | python3 -m json.tool
```

**User:** How do I expose a service only on localhost, not to the outside world?

**Agent:** Bind the port to the loopback interface:

```bash
# Only accessible from the Docker host, not from the LAN
docker run -d --name api -p 127.0.0.1:3000:3000 my-api:latest
```

**User:** When should I use host networking?

**Agent:** Use `--network host` when you need bare-metal network performance and don't need port isolation. The container shares the host's network stack directly:

```bash
docker run -d --network host my-api:latest
# The app binds directly to host ports - no NAT overhead
# No -p flag needed (or allowed)
```

Tradeoffs: no port conflict protection, no network isolation, container can see all host interfaces. Only works on Linux.

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_listNetworks` | List all Docker networks and their drivers |
| `docker_inspectContainer` | Check which networks a container is attached to, its IP addresses, and aliases |
| `docker_listContainers` | Find running containers and their network bindings |
| `docker_containerLogs` | Check for connection errors (ECONNREFUSED, DNS failures) |
| `docker_systemInfo` | Verify Docker engine supports the desired network driver |

**Diagnosing connectivity between containers:**
```
1. docker_listNetworks - find all networks
2. docker_inspectContainer on both containers - check:
   - NetworkSettings.Networks (are they on the same network?)
   - NetworkSettings.IPAddress (do they have IPs?)
   - NetworkSettings.Ports (are ports mapped correctly?)
3. docker_containerLogs - look for ECONNREFUSED or DNS errors
```

**Creating and verifying a network setup:**
```bash
# Create network
docker network create --driver bridge --subnet 172.20.0.0/16 my-net

# After attaching containers, verify with MCP:
# docker_listNetworks to confirm creation
# docker_inspectContainer to verify attachment
```

## Common Pitfalls

- **Using the default bridge network** - the default bridge has no automatic DNS. Containers must use IP addresses to find each other. Always create a custom bridge network.
- **Forgetting that host networking is Linux-only** - on macOS and Windows, `--network host` runs inside the Docker VM, not the actual host. It won't behave as expected.
- **Port conflicts with host mode** - since host networking shares the host's ports, two containers can't bind the same port. You get a silent failure or bind error.
- **Exposing ports to 0.0.0.0 by default** - `-p 3000:3000` binds to all interfaces. Use `-p 127.0.0.1:3000:3000` for local-only access.
- **Not understanding DNS scoping** - a container can only resolve names of containers on the same network. If container A is on `net1` and container B is on `net2`, they can't resolve each other.
- **Overlay network without Swarm** - overlay requires Docker Swarm mode (`docker swarm init`). Without it, `docker network create -d overlay` fails.
- **Macvlan hiding the host** - macvlan containers can reach external hosts but cannot communicate with the Docker host itself by default. This is a known limitation of macvlan.
- **Network alias collisions** - multiple containers can share an alias on the same network. Docker round-robins DNS responses, which can cause unexpected routing if not intentional.
- **Dangling networks** - old networks accumulate. Use `docker network prune` periodically to clean up unused networks.
- **Firewall rules blocking container traffic** - iptables or Windows Firewall can block Docker's port forwarding. Check firewall rules if external access fails despite correct `-p` flags.

## See Also

- [Container Debugging](../container-debugging/SKILL.md)
- [Docker Compose Helper](../docker-compose-helper/SKILL.md)
- [Docker Security](../docker-security/SKILL.md)
- [Docker Volumes](../docker-volumes/SKILL.md)
