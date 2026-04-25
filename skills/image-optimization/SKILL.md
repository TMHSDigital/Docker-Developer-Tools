---
name: image-optimization
description: Reduce Docker image size with base image selection, layer consolidation, multi-stage patterns, and distroless builds.
standards-version: 1.7.0
---

# Image Optimization

## Trigger

Use this skill when:
- A Docker image is too large for fast pulls or deployments
- CI/CD pipelines are slow due to image size
- Comparing base image options (Alpine vs slim vs distroless vs scratch)
- Analyzing image layers to find bloat
- Applying multi-stage build patterns to strip build-time dependencies
- Using BuildKit features for more efficient builds

## Required Inputs

- Current image name/tag or Dockerfile to optimize
- Application language/runtime
- Whether the image needs a shell or debugging tools in production
- Target environment (Kubernetes, ECS, local dev)

## Workflow

1. **Measure the current image** - use `docker_listImages` to get the current size, then `docker_inspectImage` for layer details.
2. **Analyze layers** - use `dive` (if installed) or `docker history` to find which layers contribute the most size.
3. **Choose the right base image** - evaluate Alpine, slim, distroless, and scratch against your requirements.
4. **Apply multi-stage builds** - separate build and runtime stages so compilers, dev headers, and source code stay out of the final image.
5. **Consolidate RUN layers** - chain commands with `&&` and clean up caches in the same layer.
6. **Create a .dockerignore** - prevent build context bloat by excluding unnecessary files.
7. **Use BuildKit cache mounts** - mount package manager caches to avoid re-downloading on every build.
8. **Rebuild and compare** - build the optimized image and compare sizes using `docker_listImages`.

## Key References

- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [BuildKit documentation](https://docs.docker.com/build/buildkit/)
- [Distroless images](https://github.com/GoogleContainerTools/distroless)
- [dive - image layer explorer](https://github.com/wagoodman/dive)
- [Docker image best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

## Example Interaction

**User:** My Node.js image is 1.2GB. Help me shrink it.

**Agent:** That's likely using `node:20` (Debian full). Let me walk through the optimization.

**Base image comparison for Node.js:**

| Base Image | Approximate Size |
|------------|-----------------|
| `node:20` | ~1.1GB |
| `node:20-slim` | ~200MB |
| `node:20-alpine` | ~130MB |
| Distroless (gcr.io/distroless/nodejs20-debian12) | ~120MB |

**Optimized multi-stage Dockerfile:**

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Install production dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Stage 2: Build the application
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --chown=app:app package.json ./

USER app
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**User:** Can I go even smaller with distroless?

**Agent:** Yes, distroless drops the shell and package manager entirely:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["dist/index.js"]
```

Trade-off: no shell means you cannot `docker exec` into the container for debugging. Use a debug variant (`gcr.io/distroless/nodejs20-debian12:debug`) in staging if needed.

**User:** How do I analyze which layers are biggest?

**Agent:**

```bash
# Quick layer breakdown
docker history my-app:latest --human --no-trunc

# Interactive analysis with dive
dive my-app:latest
```

Or use MCP tools:

```
Call docker_inspectImage with imageName "my-app:latest" to see
layer digests and total size. Then compare against the optimized
build.
```

**Go application (scratch base):**

```dockerfile
FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

This produces a final image of just the static binary plus CA certs, typically under 20MB.

**Python application (slim base):**

```dockerfile
FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=build /install /usr/local
COPY . .
RUN useradd -r app
USER app
CMD ["python", "main.py"]
```

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_listImages` | Compare image sizes before and after optimization |
| `docker_inspectImage` | Examine layer count, labels, and detailed size breakdown |
| `docker_searchHub` | Find alternative base images (Alpine, slim, distroless variants) |
| `docker_diskUsage` | Check total disk used by images and build cache |
| `docker_systemInfo` | Verify BuildKit is enabled for cache mount support |

**Before/after comparison workflow:**
```
1. Call docker_listImages - note the size of the current image.
2. Build the optimized image with a new tag.
3. Call docker_listImages again - compare the two sizes.
4. Call docker_inspectImage on both to compare layer counts.
```

**Finding slim base images:**
```
Call docker_searchHub with query "python" to find official images,
then check available tags for slim and alpine variants.
```

## Common Pitfalls

- **Alpine + glibc apps** - Alpine uses musl libc. Python packages with C extensions, Java apps, or anything linked against glibc may fail or perform poorly. Test thoroughly or use slim instead.
- **Distroless with no escape hatch** - distroless images have no shell. If you need to debug in production, keep a debug-tagged variant available or use ephemeral debug containers.
- **Cleaning caches in a separate layer** - `RUN npm install` followed by `RUN rm -rf /root/.npm` does not save space. The cache is already baked into the first layer. Clean up in the same RUN instruction.
- **Not using .dockerignore** - without it, your entire source tree (including .git, node_modules, test fixtures) is sent as build context, slowing builds even if not copied.
- **Forgetting CA certificates in scratch** - scratch images have nothing. If your app makes HTTPS calls, copy CA certs from the build stage.
- **Using `COPY . .` in the final stage** - this copies source code, tests, and configs you don't need at runtime. Be explicit about what goes into the final image.
- **BuildKit cache mounts not enabled** - `--mount=type=cache` requires BuildKit. Set `DOCKER_BUILDKIT=1` or use the `# syntax=docker/dockerfile:1` parser directive.
- **Layer squashing as a silver bullet** - `--squash` merges layers but removes cache reuse for intermediate layers. It's rarely worth the trade-off. Multi-stage builds are better.
- **Ignoring multi-platform builds** - if you target both amd64 and arm64, test your optimized image on both architectures. Alpine and distroless support multi-arch, but some base images don't.
- **Stripping too aggressively** - `go build -ldflags="-s -w"` strips debug symbols, which is fine for production but makes crash analysis harder. Keep unstripped builds for staging.

## See Also

- [Dockerfile Best Practices](../dockerfile-best-practices/SKILL.md)
- [Docker Compose Helper](../docker-compose-helper/SKILL.md)
- [Container Debugging](../container-debugging/SKILL.md)
