---
name: docker-security
description: Harden container security with rootless mode, read-only filesystems, capability management, secret handling, and image scanning.
---

# Docker Security

## Trigger

Use this skill when:
- Hardening containers for production deployment
- Running containers as non-root users
- Scanning images for vulnerabilities (CVEs)
- Managing secrets without baking them into images
- Configuring capability restrictions and security profiles
- Setting up read-only root filesystems
- Auditing existing container security posture
- Implementing network segmentation between services

## Required Inputs

- Current Dockerfile or image being hardened
- Deployment target (local dev, staging, production, regulated environment)
- Secret management requirements (env vars, files, external vault)
- Compliance requirements if any (PCI-DSS, HIPAA, SOC2)

## Workflow

1. **Run as non-root** - create a dedicated user in the Dockerfile and switch to it with `USER`.
2. **Drop all capabilities** - use `--cap-drop ALL` and add back only what's needed with `--cap-add`.
3. **Enable read-only root filesystem** - use `--read-only` and mount writable tmpfs for directories that need writes.
4. **Set no-new-privileges** - prevent privilege escalation with `--security-opt no-new-privileges`.
5. **Scan images for vulnerabilities** - use `docker scout`, Trivy, or Snyk to find and fix CVEs.
6. **Handle secrets properly** - never put secrets in ENV, ARG, or layers. Use BuildKit secret mounts for build-time and Docker secrets or external vaults for runtime.
7. **Enable content trust** - set `DOCKER_CONTENT_TRUST=1` to verify image signatures.
8. **Apply security profiles** - use seccomp and AppArmor profiles to restrict syscalls.
9. **Segment networks** - put each service tier on a separate Docker network.

## Key References

- [Docker security overview](https://docs.docker.com/engine/security/)
- [Rootless mode](https://docs.docker.com/engine/security/rootless/)
- [Docker Scout quickstart](https://docs.docker.com/scout/quickstart/)
- [Content trust](https://docs.docker.com/engine/security/trust/)
- [Seccomp security profiles](https://docs.docker.com/engine/security/seccomp/)
- [AppArmor security profiles](https://docs.docker.com/engine/security/apparmor/)

## Example Interaction

**User:** How do I run a container as securely as possible?

**Agent:** Apply defense in depth with these flags:

```bash
docker run -d --name secure-api \
  --read-only \
  --tmpfs /tmp:rw,noexec,size=50m \
  --tmpfs /var/run:rw,noexec,size=10m \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  --security-opt no-new-privileges \
  --security-opt seccomp=default \
  --user 1000:1000 \
  --memory 256m \
  --cpus 0.5 \
  --pids-limit 100 \
  --network app-net \
  -p 127.0.0.1:3000:3000 \
  my-api:latest
```

Breakdown:
- `--read-only` - root filesystem is read-only, writes only to tmpfs
- `--cap-drop ALL --cap-add NET_BIND_SERVICE` - minimal capabilities
- `--no-new-privileges` - blocks setuid/setgid binaries
- `--user 1000:1000` - runs as non-root
- `--memory`, `--cpus`, `--pids-limit` - resource limits prevent DoS
- `--network app-net` - isolated from other networks
- `-p 127.0.0.1:3000:3000` - only exposed on localhost

**User:** How do I scan my image for vulnerabilities?

**Agent:** Several options, from built-in to third-party:

```bash
# Docker Scout (built into Docker Desktop)
docker scout cves my-api:latest
docker scout recommendations my-api:latest

# Trivy (open source, CI-friendly)
trivy image my-api:latest
trivy image --severity HIGH,CRITICAL my-api:latest

# Snyk
snyk container test my-api:latest
```

Integrate into CI to block deploys with critical CVEs:

```bash
# Fail the build if any critical vulnerability is found
trivy image --exit-code 1 --severity CRITICAL my-api:latest
```

**User:** How do I handle secrets during the build without leaking them into layers?

**Agent:** Use BuildKit secret mounts. Secrets are available during the build but never stored in any layer:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./

# Mount the npm token as a secret during install
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --omit=dev

COPY . .
USER node
CMD ["node", "dist/index.js"]
```

```bash
# Pass the secret at build time
docker build --secret id=npmrc,src=$HOME/.npmrc -t my-api:latest .
```

For runtime secrets, use Docker Swarm secrets or mount from an external vault:

```bash
# Swarm secrets
echo "db-password-here" | docker secret create db_password -
docker service create --secret db_password --name api my-api:latest

# Or mount a secret file read-only
docker run -d -v ./secrets/db-pass.txt:/run/secrets/db_password:ro my-api:latest
```

**User:** How do I enforce non-root in the Dockerfile?

**Agent:**

```dockerfile
FROM node:20-alpine

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app
COPY --chown=app:app . .
RUN npm ci --omit=dev

USER app
EXPOSE 3000
CMD ["node", "index.js"]
```

Verify after building:

```bash
docker run --rm my-api:latest whoami
# Expected output: app

docker run --rm my-api:latest id
# Expected: uid=100(app) gid=101(app)
```

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_inspectImage` | Check image user, exposed ports, entrypoint, and labels |
| `docker_inspectContainer` | Verify security settings - capabilities, read-only status, user |
| `docker_listContainers` | Find running containers to audit their security posture |
| `docker_listNetworks` | Verify network segmentation between service tiers |
| `docker_systemInfo` | Check if rootless mode is active, security options available |
| `docker_searchHub` | Find official images with better security track records |

**Security audit workflow with MCP:**
```
1. docker_listContainers - enumerate all running containers
2. docker_inspectContainer on each - check:
   - Config.User (should not be empty or "root")
   - HostConfig.ReadonlyRootfs (should be true in production)
   - HostConfig.CapDrop (should include "ALL")
   - HostConfig.SecurityOpt (should include "no-new-privileges")
   - HostConfig.Memory (should have a limit set)
3. docker_inspectImage - verify:
   - Config.User is set in the image
   - No secrets visible in Config.Env
4. docker_listNetworks - confirm services are on separate networks
```

**Checking for secrets in environment variables:**
```
Call docker_inspectContainer and review Config.Env for any values
that look like passwords, tokens, or API keys. These should be
mounted as files or pulled from a secrets manager instead.
```

## Common Pitfalls

- **Running as root by default** - if no `USER` instruction exists, the container runs as root (UID 0). Always set a non-root user.
- **Putting secrets in ENV or ARG** - environment variables are visible via `docker inspect` and `docker history`. Use BuildKit `--mount=type=secret` for build-time and file mounts for runtime.
- **Not scanning regularly** - base images get new CVEs daily. Scan in CI on every build, and re-scan deployed images on a schedule.
- **Dropping capabilities without testing** - `--cap-drop ALL` may break some applications. Test thoroughly and add back only the specific capabilities needed.
- **Read-only filesystem breaking apps** - many apps write to `/tmp`, `/var/run`, or cache directories. Mount those as tmpfs: `--tmpfs /tmp:rw,noexec,size=50m`.
- **Assuming distroless means secure** - distroless images have a smaller attack surface but can still contain vulnerable libraries. Scan them like any other image.
- **Content trust without key management** - enabling `DOCKER_CONTENT_TRUST=1` requires managing signing keys. Lost keys mean you can't push new images to that repository.
- **Ignoring the build context** - without `.dockerignore`, secrets in the build directory (`.env`, `credentials.json`, SSH keys) can be copied into the image via `COPY . .`.
- **Using `--privileged` in production** - this flag disables all security features. Never use it outside of very specific development scenarios.
- **Network-level trust assumptions** - containers on the same bridge network can freely communicate. Use separate networks per tier (frontend, backend, database) with explicit connections.

## See Also

- [Dockerfile Best Practices](../dockerfile-best-practices/SKILL.md)
- [Image Optimization](../image-optimization/SKILL.md)
- [Docker Networking](../docker-networking/SKILL.md)
- [Docker CI/CD](../docker-ci-cd/SKILL.md)
