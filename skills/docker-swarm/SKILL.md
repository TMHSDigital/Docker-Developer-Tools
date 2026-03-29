---
name: docker-swarm
description: Docker Swarm mode orchestration - cluster management, service deployment, scaling, node administration, and rolling updates
---

# Docker Swarm Orchestration

Manage Docker Swarm clusters, deploy and scale services, administer nodes, and perform rolling updates and rollbacks.

## Trigger

Activate when the user:
- Asks about Docker Swarm mode or cluster orchestration
- Wants to initialize, join, or manage a Swarm cluster
- Needs to create, update, scale, or rollback Swarm services
- Asks about node management, promotion, demotion, or draining
- Mentions "swarm init", "service create", "node ls", or "rolling update"

## Required Inputs

- **Task type**: cluster setup, service management, node administration, or troubleshooting
- **Cluster details** (for init/join): advertise address, join token, remote manager address
- **Service details** (for create/update): image, replicas, ports, resource limits

## Workflow

1. **Assess cluster state** - Use `docker_nodeLs` to check existing nodes and `docker_serviceLs` to list running services.
2. **Initialize or join** - Use `docker_swarmInit` to bootstrap a new cluster or `docker_swarmJoin` to add nodes.
3. **Deploy services** - Use `docker_serviceCreate` with appropriate replicas, ports, networks, and resource limits.
4. **Monitor and scale** - Use `docker_servicePs` to check task distribution, `docker_serviceLogs` for debugging, and `docker_serviceScale` to adjust replicas.
5. **Update or rollback** - Use `docker_serviceUpdate` for rolling updates and `docker_serviceRollback` to revert if issues arise.
6. **Manage nodes** - Use `docker_nodeUpdate` to drain nodes for maintenance, `docker_nodePromote`/`docker_nodeDemote` for role changes.

## Key References

- Docker CLI: `docker swarm init`, `docker swarm join`, `docker service create`, `docker service update`, `docker service scale`, `docker node ls`, `docker node update`
- Swarm port: 2377/tcp (cluster management), 7946/tcp+udp (node communication), 4789/udp (overlay network)
- Service modes: `replicated` (specified number of tasks) vs `global` (one task per node)

## Example Interaction

**User**: "Set up a 3-replica nginx service with a rolling update strategy"

**Assistant**: First checks if this node is a Swarm manager.
- Calls `docker_nodeLs` to verify cluster state
- If not in swarm mode, calls `docker_swarmInit` to initialize
- Calls `docker_serviceCreate` with name, image, replicas=3, ports, and resource limits
- Calls `docker_servicePs` to verify all 3 tasks are running
- Explains how to update with `docker_serviceUpdate --image nginx:new --update-parallelism 1 --update-delay 10s`

## MCP Usage

| Tool | When to Use |
|------|-------------|
| `docker_swarmInit` | Initializing a new Swarm cluster |
| `docker_swarmJoin` | Adding worker or manager nodes to the cluster |
| `docker_swarmLeave` | Removing the current node from the Swarm |
| `docker_swarmJoinToken` | Retrieving or rotating join tokens |
| `docker_swarmUpdate` | Updating Swarm-wide settings (task history, cert expiry, autolock) |
| `docker_swarmUnlock` | Unlocking a locked Swarm manager after restart |
| `docker_swarmUnlockKey` | Retrieving or rotating the Swarm unlock key |
| `docker_swarmCa` | Viewing or rotating the cluster root CA certificate |
| `docker_serviceCreate` | Deploying a new replicated or global service |
| `docker_serviceUpdate` | Rolling updates to image, replicas, env, or resources |
| `docker_serviceRm` | Removing services from the Swarm |
| `docker_serviceLs` | Listing all services and their status |
| `docker_serviceInspect` | Viewing detailed service configuration |
| `docker_serviceLogs` | Retrieving service or task logs for debugging |
| `docker_servicePs` | Checking task distribution across nodes |
| `docker_serviceScale` | Scaling services up or down |
| `docker_serviceRollback` | Reverting a service to its previous version |
| `docker_nodeLs` | Listing all nodes in the cluster |
| `docker_nodeInspect` | Viewing detailed node information |
| `docker_nodePs` | Listing tasks running on a specific node |
| `docker_nodeRm` | Removing nodes from the cluster |
| `docker_nodeUpdate` | Changing node availability (active/drain) or role |
| `docker_nodePromote` | Promoting workers to managers for HA |
| `docker_nodeDemote` | Demoting managers to workers |

## Common Pitfalls

1. **Single manager** - A single-manager Swarm has no fault tolerance. Promote at least 2 additional nodes to manager (odd numbers: 3, 5, 7).
2. **Draining without replacement** - Draining a node moves all tasks to other nodes. Ensure sufficient capacity before draining.
3. **Missing resource limits** - Services without CPU/memory limits can starve other services on the same node.
4. **Port conflicts** - Published ports in `ingress` mode are cluster-wide. Two services cannot publish the same host port.
5. **Overlay network encryption** - Overlay networks are unencrypted by default. Use `--opt encrypted` for sensitive traffic between nodes.
6. **Token exposure** - Join tokens grant cluster access. Rotate them regularly with `docker_swarmJoinToken` and never commit them to repos.
7. **Autolock disabled** - Without autolock, a stolen disk image of a manager node exposes all cluster secrets. Enable with `docker_swarmUpdate`.

## See Also

- `docker-security` skill - for general container security hardening
- `docker-networking` skill - for overlay network configuration
- `docker-resource-management` skill - for CPU/memory limits and monitoring
- `swarm-security` rule - automated checks for Swarm security issues
