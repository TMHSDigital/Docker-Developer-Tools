---
name: docker-multi-platform
description: Multi-architecture builds, buildx builder configuration, manifest lists, platform targeting, and cross-compilation patterns.
standards-version: 1.7.0
---

# Docker Multi-Platform Builds

## Trigger

Use this skill when:
- Building Docker images for multiple CPU architectures (amd64, arm64, armv7, s390x)
- Configuring buildx builders for multi-platform output
- Creating or managing manifest lists for multi-arch image distribution
- Setting up CI/CD pipelines that produce multi-platform images
- Troubleshooting cross-compilation or platform-specific build failures
- Optimizing build cache for multi-platform workflows

## Required Inputs

- Target platforms (e.g. linux/amd64, linux/arm64)
- Dockerfile path and build context
- Registry destination (if pushing multi-platform images)
- Builder driver preference (docker-container, kubernetes, remote)

## Workflow

1. **Assess platform requirements** - determine which architectures the image must support
2. **Configure builder** - create or select a buildx builder with the right driver
3. **Prepare Dockerfile** - ensure platform-agnostic instructions or use `TARGETPLATFORM` / `TARGETARCH` ARGs
4. **Build** - run `docker buildx build --platform` with appropriate cache and output options
5. **Verify** - inspect the resulting manifest list to confirm all platforms are present
6. **Distribute** - push to registry or use `docker buildx imagetools` to combine images

## Key References

- `docker buildx build --platform linux/amd64,linux/arm64` - the core multi-platform build command
- `docker buildx create --driver docker-container` - create a builder capable of multi-platform
- `docker buildx ls` - verify available builders and their platform support
- `docker manifest create` / `annotate` / `push` - manual manifest list management
- `TARGETPLATFORM`, `TARGETARCH`, `TARGETOS`, `TARGETVARIANT` - automatic ARGs available in Dockerfiles during cross-builds

## Example Interaction

**User**: I need my Go API image to run on both amd64 and arm64. How do I set that up?

**Assistant**: Here's the approach:

1. Create a buildx builder with docker-container driver (supports multi-platform):

```
docker buildx create --name multiarch --driver docker-container --use
```

2. Use a multi-stage Dockerfile with cross-compilation:

```dockerfile
FROM --platform=$BUILDPLATFORM golang:1.22-alpine AS builder
ARG TARGETARCH
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOARCH=$TARGETARCH go build -o /api .

FROM alpine:3.20
COPY --from=builder /api /api
ENTRYPOINT ["/api"]
```

3. Build and push for both platforms:

```
docker buildx build --platform linux/amd64,linux/arm64 \
  --tag myregistry/api:latest --push .
```

4. Verify the manifest:

```
docker manifest inspect myregistry/api:latest
```

## MCP Usage

This skill leverages the following MCP tools:

- `docker_buildxBuild` - run multi-platform builds with cache and provenance options
- `docker_buildxLs` - list builders and check platform support
- `docker_buildxCreate` - create a builder with the right driver for multi-platform
- `docker_buildxRm` - clean up builders no longer needed
- `docker_buildxInspect` - check builder status and supported platforms
- `docker_buildxUse` - switch between builders
- `docker_buildxImagetools` - inspect and create manifest lists via buildx
- `docker_builderPrune` - clean build cache
- `docker_manifestCreate` - create manifest lists manually
- `docker_manifestInspect` - verify manifest list contents and platforms
- `docker_manifestAnnotate` - set platform metadata on manifest entries
- `docker_manifestPush` - push manifest lists to registries
- `docker_manifestRm` - remove local manifest lists
- `docker_build` - single-platform builds (for comparison or fallback)

## Common Pitfalls

- **Using `docker build` instead of `docker buildx build`** - the regular `docker build` cannot produce multi-platform images. You need buildx with a docker-container or remote driver.
- **Default builder lacks multi-platform** - the default `docker` driver only builds for the host architecture. Create a builder with `--driver docker-container`.
- **Architecture-specific commands in Dockerfile** - hardcoded `wget` URLs with `amd64` in the path, or architecture-specific binaries, break on other platforms. Use `TARGETARCH` ARG.
- **Missing QEMU for emulated builds** - cross-architecture builds need QEMU registered. Run `docker run --privileged --rm tonistiigi/binfmt --install all` first.
- **`--push` vs `--load`** - multi-platform builds cannot use `--load` (which loads into local Docker). Use `--push` to a registry, or build one platform at a time with `--load`.
- **No cache configuration** - multi-platform builds are slow. Use `--cache-from` and `--cache-to` with registry or local cache backends.
- **Forgetting `--platform` in FROM** - in multi-stage builds, the build stage should use `FROM --platform=$BUILDPLATFORM` to run on the host architecture for speed, while the runtime stage inherits the target platform.

## See Also

- [dockerfile-best-practices](../dockerfile-best-practices/SKILL.md) - general Dockerfile optimization
- [image-optimization](../image-optimization/SKILL.md) - reducing image sizes (applies per-platform)
- [docker-registry](../docker-registry/SKILL.md) - pushing multi-arch images to registries
- [docker-ci-cd](../docker-ci-cd/SKILL.md) - CI/CD pipelines with multi-platform builds
