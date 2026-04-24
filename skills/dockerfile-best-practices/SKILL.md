---
name: dockerfile-best-practices
description: Write and optimize Dockerfiles with multi-stage builds, layer caching, image size reduction, and security hardening.
standards-version: 1.6.3
---

# Dockerfile Best Practices

## Trigger

Use this skill when:
- Writing a new Dockerfile from scratch
- Reviewing or optimizing an existing Dockerfile
- Reducing image size or build time
- Hardening a container image for production
- Fixing layer caching issues that slow CI/CD builds

## Required Inputs

- Target application language/runtime (e.g., Node.js, Python, Go, Java)
- Whether the image is for development or production
- Any specific base image requirements or constraints

## Workflow

1. **Choose the right base image** - prefer Alpine or slim variants; pin versions with tags or SHA digests. Never use `latest`.
2. **Set up multi-stage builds** - separate build dependencies from the final runtime image.
3. **Order layers for cache efficiency** - put rarely-changing layers (system deps) before frequently-changing layers (app code).
4. **Consolidate RUN instructions** - chain commands with `&&` and clean up in the same layer.
5. **Use COPY over ADD** - ADD has implicit tar extraction and URL fetching that introduce unpredictable behavior. Use COPY unless you specifically need tar auto-extraction.
6. **Create a .dockerignore** - exclude node_modules, .git, build artifacts, and secrets.
7. **Run as non-root** - create a dedicated user and switch to it before CMD.
8. **Add HEALTHCHECK** - define health probes so orchestrators know when the container is ready.
9. **Add LABEL metadata** - include maintainer, version, and description for image discoverability.
10. **Validate with MCP tools** - use `docker_listImages` and `docker_inspectImage` to verify the final result.

## Key References

- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [BuildKit documentation](https://docs.docker.com/build/buildkit/)

## Example Interaction

**User:** Write a production Dockerfile for a Node.js API.

**Agent:** Here is a multi-stage Dockerfile with layer caching, non-root user, and health check:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

LABEL org.opencontainers.image.title="my-api" \
      org.opencontainers.image.version="1.0.0"

CMD ["node", "dist/index.js"]
```

And a `.dockerignore`:

```
node_modules
.git
.env
dist
*.md
Dockerfile
.dockerignore
```

**User:** How do I check the image size after building?

**Agent:** Build the image, then use the MCP tool:

```
docker build -t my-api:1.0.0 .
```

Then call `docker_listImages` to see all images and their sizes, or `docker_inspectImage` with `imageName: "my-api:1.0.0"` for full details.

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_listImages` | List all local images to compare sizes after optimization |
| `docker_inspectImage` | Inspect a built image for layer count, labels, exposed ports, and entrypoint |
| `docker_searchHub` | Find official or slim base images on Docker Hub |
| `docker_diskUsage` | Check total disk used by images, containers, and build cache |
| `docker_systemInfo` | Verify BuildKit is enabled and check Docker engine version |

**Checking image size after a build:**
```
Call docker_listImages to see image sizes, then docker_inspectImage
with the image name to inspect layers and metadata.
```

**Finding a base image:**
```
Call docker_searchHub with query "node" to find official Node.js
images and their available tags.
```

## Common Pitfalls

- **Using ADD instead of COPY** - ADD auto-extracts tars and can fetch URLs, which makes builds less predictable. Use COPY unless you need extraction.
- **Not pinning base image versions** - `FROM node:latest` will break builds when a new major version drops. Pin to `node:20-alpine` or a SHA digest.
- **Installing dev dependencies in production** - use `npm ci --omit=dev` or `pip install --no-dev` in the final stage.
- **Leaving package manager caches** - add `rm -rf /var/cache/apk/*` or `apt-get clean` in the same RUN layer as the install.
- **Running as root** - always create and switch to a non-root user. Many orchestrators reject root containers by policy.
- **Splitting RUN commands unnecessarily** - each RUN creates a layer. Combine related commands with `&&` to reduce layer count and image size.
- **Forgetting .dockerignore** - without it, `COPY . .` sends your entire directory (including .git, node_modules, secrets) to the build context.
- **Putting COPY . . before dependency install** - this busts the cache on every code change. Copy dependency manifests first, install, then copy the rest.
- **Using ARG for secrets** - ARG values are visible in `docker history`. Use BuildKit secret mounts (`--mount=type=secret`) instead.
- **No HEALTHCHECK** - orchestrators can't determine readiness without one. Always add a health endpoint and a HEALTHCHECK instruction.

## See Also

- [Image Optimization](../image-optimization/SKILL.md)
- [Docker Compose Helper](../docker-compose-helper/SKILL.md)
- [Container Debugging](../container-debugging/SKILL.md)
