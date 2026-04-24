---
name: docker-registry
description: Work with container registries including Docker Hub, GHCR, ECR, and ACR for pushing, pulling, and tag management.
standards-version: 1.6.3
---

# Docker Registry

## Trigger

Use this skill when:
- Pushing or pulling images to/from Docker Hub, GHCR, ECR, ACR, or GCR
- Setting up authentication for private registries
- Choosing a tagging strategy (semver, SHA, branch-based)
- Configuring credential helpers for automated workflows
- Working with image digests and content-addressable references
- Building and pushing multi-architecture manifests
- Setting up a private or self-hosted registry
- Migrating images between registries

## Required Inputs

- Target registry (Docker Hub, GHCR, ECR, ACR, GCR, self-hosted)
- Authentication method (token, credential helper, service account)
- Image naming convention and tagging strategy
- Whether multi-arch support is needed

## Workflow

1. **Authenticate to the registry** - use `docker login` or a credential helper to store credentials securely.
2. **Tag the image** - apply the full registry path and version tag using `docker tag`.
3. **Push the image** - push tagged images with `docker push`. For multi-arch, use `docker buildx build --push` or `docker manifest`.
4. **Verify the push** - confirm the image digest matches and the tag is visible in the registry.
5. **Set up credential helpers** - configure `docker-credential-*` helpers to avoid plaintext passwords in `~/.docker/config.json`.
6. **Manage tags and cleanup** - prune old tags, set retention policies, and use digest-based references for immutable deploys.

## Key References

- [Docker Hub quickstart](https://docs.docker.com/docker-hub/)
- [GHCR documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [ECR user guide](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html)
- [ACR documentation](https://learn.microsoft.com/en-us/azure/container-registry/)
- [GCR / Artifact Registry](https://cloud.google.com/artifact-registry/docs)
- [Docker registry HTTP API](https://docs.docker.com/registry/spec/api/)
- [Multi-platform images](https://docs.docker.com/build/building/multi-platform/)

## Example Interaction

**User:** How do I push an image to GHCR?

**Agent:** Authenticate with a personal access token (or `GITHUB_TOKEN` in CI), then tag and push:

```bash
# Log in to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Tag the image with the full GHCR path
docker tag my-api:latest ghcr.io/your-org/my-api:1.2.0

# Push
docker push ghcr.io/your-org/my-api:1.2.0
```

The PAT needs `write:packages` scope. In GitHub Actions, `GITHUB_TOKEN` works automatically with `packages: write` permission.

**User:** How do I push to ECR?

**Agent:** ECR requires an AWS login token that expires every 12 hours:

```bash
# Get a login token and pipe it to docker login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Create the repository if it doesn't exist
aws ecr create-repository --repository-name my-api --region us-east-1

# Tag and push
docker tag my-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/my-api:1.2.0
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/my-api:1.2.0
```

For automation, use the Amazon ECR credential helper to avoid the 12-hour expiry:

```json
{
  "credHelpers": {
    "123456789.dkr.ecr.us-east-1.amazonaws.com": "ecr-login"
  }
}
```

Save that to `~/.docker/config.json` and install `docker-credential-ecr-login`.

**User:** What about ACR?

**Agent:**

```bash
# Log in with Azure CLI
az acr login --name myregistry

# Or use a service principal for CI
docker login myregistry.azurecr.io \
  -u $SP_APP_ID \
  -p $SP_PASSWORD

# Tag and push
docker tag my-api:latest myregistry.azurecr.io/my-api:1.2.0
docker push myregistry.azurecr.io/my-api:1.2.0
```

**User:** What tagging strategy should I use?

**Agent:** Use a combination of tags for different purposes:

```bash
# Semver for releases
docker tag my-api:latest ghcr.io/org/my-api:2.1.0
docker tag my-api:latest ghcr.io/org/my-api:2.1
docker tag my-api:latest ghcr.io/org/my-api:2

# Git SHA for traceability
docker tag my-api:latest ghcr.io/org/my-api:sha-a1b2c3d

# Branch name for dev/staging
docker tag my-api:latest ghcr.io/org/my-api:main
docker tag my-api:latest ghcr.io/org/my-api:feature-auth

# latest only on stable releases from the default branch
docker tag my-api:latest ghcr.io/org/my-api:latest
```

For production deployments, pin to a digest for immutability:

```bash
# Pull by digest - this is guaranteed to be the exact same image
docker pull ghcr.io/org/my-api@sha256:abc123def456...
```

**User:** How do I push multi-arch images?

**Agent:** Use `docker buildx` to build and push a manifest list:

```bash
# Create a builder that supports multi-platform
docker buildx create --name multiarch --use

# Build and push for multiple architectures in one command
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag ghcr.io/org/my-api:1.2.0 \
  --push .
```

Or create a manifest manually from per-arch images:

```bash
docker manifest create ghcr.io/org/my-api:1.2.0 \
  ghcr.io/org/my-api:1.2.0-amd64 \
  ghcr.io/org/my-api:1.2.0-arm64

docker manifest push ghcr.io/org/my-api:1.2.0
```

**User:** How do I set up a private registry?

**Agent:** Run the official registry image:

```bash
docker run -d -p 5000:5000 --name registry \
  -v registry-data:/var/lib/registry \
  --restart always \
  registry:2
```

With TLS and basic auth for production:

```bash
docker run -d -p 443:5000 --name registry \
  -v /certs:/certs:ro \
  -v /auth:/auth:ro \
  -v registry-data:/var/lib/registry \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/fullchain.pem \
  -e REGISTRY_HTTP_TLS_KEY=/certs/privkey.pem \
  -e REGISTRY_AUTH=htpasswd \
  -e REGISTRY_AUTH_HTPASSWD_REALM="Registry Realm" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  --restart always \
  registry:2
```

Create the htpasswd file:

```bash
htpasswd -Bbn myuser mypassword > /auth/htpasswd
```

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_listImages` | List local images with their tags and sizes before pushing |
| `docker_inspectImage` | Check image digest, architecture, and labels before tagging |
| `docker_searchHub` | Search Docker Hub for official and community images |
| `docker_systemInfo` | Check configured registries and credential stores |
| `docker_diskUsage` | See how much space pulled images consume locally |

**Pre-push verification workflow:**
```
1. docker_listImages - find the image and confirm the tag exists locally
2. docker_inspectImage - verify:
   - RepoDigests for the content-addressable hash
   - Architecture matches intended target
   - Labels include version metadata
   - Config.User is set (not running as root)
3. docker_systemInfo - confirm credential store is configured
```

**Searching for base images:**
```
Call docker_searchHub with terms like "node", "python", or "nginx"
to find official images. Check star count and official status
to pick well-maintained base images.
```

## Common Pitfalls

- **Plaintext credentials in config.json** - `docker login` stores passwords in `~/.docker/config.json` by default. Use credential helpers (`docker-credential-osxkeychain`, `docker-credential-wincred`, `docker-credential-pass`) to store them securely.
- **ECR token expiry** - ECR login tokens expire after 12 hours. Use the `ecr-login` credential helper for long-running systems or CI pipelines.
- **Pushing without the full registry path** - `docker push my-api:latest` pushes to Docker Hub under your account. Always tag with the full registry URL first.
- **Overwriting mutable tags** - tags like `latest` or `v1` are mutable. A push overwrites the previous image. Use digest-based references for production deployments.
- **Forgetting to create the ECR repository** - ECR requires the repository to exist before pushing. Other registries create it on first push.
- **Rate limits on Docker Hub** - anonymous pulls are limited to 100 per 6 hours, authenticated to 200. Use a mirror or cache for CI.
- **GHCR package visibility** - new GHCR packages default to private. You must explicitly change visibility in the package settings.
- **Multi-arch tag conflicts** - pushing a single-arch image to a tag that was previously a multi-arch manifest replaces the manifest. Use `buildx` or `docker manifest` to maintain multi-arch support.
- **Not using .dockerignore before push** - large build contexts slow down builds and can leak secrets into images. Always have a `.dockerignore`.
- **Self-hosted registry without TLS** - Docker refuses to push to HTTP registries by default. Configure `insecure-registries` in daemon.json for dev, or add TLS for production.

## See Also

- [Docker CI/CD](../docker-ci-cd/SKILL.md)
- [Image Optimization](../image-optimization/SKILL.md)
- [Docker Security](../docker-security/SKILL.md)
- [Dockerfile Best Practices](../dockerfile-best-practices/SKILL.md)
