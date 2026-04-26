---
name: docker-ci-cd
description: Use Docker in CI/CD pipelines with GitHub Actions, multi-platform builds, registry push, and layer caching strategies.
standards-version: 1.9.0
---

# Docker CI/CD

## Trigger

Use this skill when:
- Setting up Docker builds in GitHub Actions or GitLab CI
- Building multi-platform images (amd64, arm64)
- Pushing images to Docker Hub, GHCR, ECR, or other registries
- Optimizing CI build times with layer caching
- Defining a tagging strategy for releases
- Setting up Docker-in-Docker for CI environments
- Automating image scanning in the build pipeline

## Required Inputs

- CI platform (GitHub Actions, GitLab CI, Jenkins, CircleCI)
- Target registry (Docker Hub, GHCR, ECR, GCR, ACR)
- Target architectures (amd64, arm64, or both)
- Tagging strategy (semver, git SHA, branch name, latest)
- Whether vulnerability scanning should block deploys

## Workflow

1. **Configure registry authentication** - store credentials as CI secrets and log in during the pipeline.
2. **Set up buildx** - use Docker Buildx for multi-platform builds and advanced caching.
3. **Define image tags** - generate tags from git metadata (branch, tag, SHA) using `docker/metadata-action` or equivalent.
4. **Enable layer caching** - use GitHub Actions cache, registry cache, or local cache to avoid rebuilding unchanged layers.
5. **Build and push** - use `docker/build-push-action` or `docker buildx build --push`.
6. **Scan for vulnerabilities** - run Trivy, Snyk, or Docker Scout after building and fail on critical CVEs.
7. **Test the image** - pull the built image and run smoke tests before deploying.

## Key References

- [docker/build-push-action](https://github.com/docker/build-push-action)
- [docker/metadata-action](https://github.com/docker/metadata-action)
- [Buildx documentation](https://docs.docker.com/build/builders/)
- [GitHub Actions cache for Docker](https://docs.docker.com/build/ci/github-actions/cache/)
- [GitLab CI Docker-in-Docker](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html)
- [Multi-platform builds](https://docs.docker.com/build/building/multi-platform/)

## Example Interaction

**User:** Set up a GitHub Actions workflow to build and push a Docker image to GHCR.

**Agent:** Here's a complete workflow with multi-platform builds, caching, and tagging:

```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags: ["v*"]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix=
            type=ref,event=branch
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

**User:** How do I add vulnerability scanning to that pipeline?

**Agent:** Add a scan step after the build:

```yaml
      - name: Scan for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}
          format: table
          exit-code: 1
          severity: CRITICAL,HIGH
          ignore-unfixed: true
```

Or use Docker Scout if you prefer the built-in option:

```yaml
      - name: Docker Scout scan
        uses: docker/scout-action@v1
        with:
          command: cves
          image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}
          only-severities: critical,high
          exit-code: true
```

**User:** What about GitLab CI?

**Agent:** Here's the GitLab equivalent using Docker-in-Docker:

```yaml
# .gitlab-ci.yml
stages:
  - build

variables:
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

build:
  stage: build
  image: docker:27
  services:
    - docker:27-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build
        --cache-from $CI_REGISTRY_IMAGE:latest
        --build-arg BUILDKIT_INLINE_CACHE=1
        -t $IMAGE_TAG
        -t $CI_REGISTRY_IMAGE:latest
        .
    - docker push $IMAGE_TAG
    - docker push $CI_REGISTRY_IMAGE:latest
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

**User:** What caching strategies are available?

**Agent:** Three main options, each with tradeoffs:

```yaml
# 1. GitHub Actions cache (gha) - fast, 10GB limit per repo
cache-from: type=gha
cache-to: type=gha,mode=max

# 2. Registry cache - unlimited size, stored alongside your image
cache-from: type=registry,ref=ghcr.io/myorg/myapp:buildcache
cache-to: type=registry,ref=ghcr.io/myorg/myapp:buildcache,mode=max

# 3. Local cache - useful for self-hosted runners
cache-from: type=local,src=/tmp/.buildx-cache
cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max
```

The `mode=max` flag caches all layers, not just the final image layers. This is critical for multi-stage builds where intermediate layers would otherwise be uncached.

**User:** How do I pass build args from CI secrets?

**Agent:**

```yaml
      - name: Build with secrets
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          build-args: |
            APP_VERSION=${{ github.ref_name }}
            NODE_ENV=production
          secrets: |
            npmrc=${{ secrets.NPM_TOKEN }}
```

In the Dockerfile, consume the secret (not the build arg) for sensitive values:

```dockerfile
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
```

Build args are fine for non-sensitive values like version strings. Never pass passwords or tokens as build args.

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_listImages` | Verify built images exist locally and check their sizes |
| `docker_inspectImage` | Check labels, architecture, and layers of a built image |
| `docker_searchHub` | Find official base images and their tags for CI pipelines |
| `docker_systemInfo` | Verify buildx and multi-platform support is available |
| `docker_diskUsage` | Monitor build cache size on self-hosted runners |
| `docker_listContainers` | Check test containers spawned during CI smoke tests |

**Verifying a CI-built image locally:**
```
1. docker_listImages - find the built image and check its size
2. docker_inspectImage - verify:
   - Architecture matches target platforms
   - Labels include version and commit SHA
   - Config.User is not root
   - No secrets in Config.Env
3. docker_listContainers - after smoke test, verify test containers ran
```

**Checking build cache usage on runners:**
```
Call docker_diskUsage to see how much space the build cache
consumes. If it's growing unbounded on self-hosted runners,
add a cache cleanup step to the pipeline.
```

## Common Pitfalls

- **Not caching multi-stage intermediate layers** - default cache mode only caches the final stage. Always use `mode=max` to cache all stages.
- **GitHub Actions cache eviction** - the 10GB cache limit is shared across all workflows in a repo. Heavy caching can evict other workflow caches. Consider registry cache for large images.
- **QEMU builds are slow** - building arm64 images on amd64 runners via QEMU emulation can be 5-10x slower. Use native arm64 runners for large builds if available.
- **Tagging with `latest` on every push** - `latest` should only point to the most recent stable release. Tag PRs with the branch name or SHA, not `latest`.
- **Build args leaking secrets** - ARG values are visible in `docker history`. Use `--mount=type=secret` for anything sensitive.
- **Docker-in-Docker socket security** - mounting `/var/run/docker.sock` in CI gives the build container full control over the host's Docker daemon. Use Docker-in-Docker (dind) with TLS for better isolation.
- **Not pinning action versions** - using `@master` for GitHub Actions can break workflows. Pin to a specific version tag or SHA.
- **Missing platform in the Dockerfile** - `FROM --platform=$BUILDPLATFORM` is needed for cross-compilation stages. Without it, intermediate stages run under emulation.
- **Forgetting to log in before push** - builds succeed but push fails with auth errors. Always add the login step before build-push.
- **Cache poisoning from PRs** - GitHub Actions cache is shared. A malicious PR could push a poisoned cache. Use `cache-from` carefully and consider read-only cache for PR builds.
- **Ignoring build duration** - CI builds over 10 minutes waste developer time and money. Profile with `--progress=plain` to find slow layers and optimize.

## See Also

- [Dockerfile Best Practices](../dockerfile-best-practices/SKILL.md)
- [Image Optimization](../image-optimization/SKILL.md)
- [Docker Security](../docker-security/SKILL.md)
- [Docker Compose Helper](../docker-compose-helper/SKILL.md)
