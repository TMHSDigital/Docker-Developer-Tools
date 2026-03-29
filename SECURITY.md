# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Docker Developer Tools, please report it responsibly via [GitHub private security advisory](https://github.com/TMHSDigital/Docker-Developer-Tools/security/advisories/new).

**Please do not open a public issue for security vulnerabilities.**

## Scope

This plugin consists of:

- **Markdown skill files** - contain documentation and workflow guidance only
- **MDC rule files** - contain pattern matching rules only
- **MCP server** - TypeScript server that executes Docker CLI commands locally

The MCP server executes `docker` CLI commands on the user's local machine. It does not expose any network services, connect to remote APIs, or handle authentication tokens. The primary security concern is ensuring the server does not execute arbitrary commands beyond the intended Docker CLI operations.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |
| < 0.1   | No        |

## Response Timeline

- **Acknowledgment:** Within 48 hours of report
- **Initial assessment:** Within 7 days
- **Fix or mitigation:** Depends on severity, typically within 14 days for critical issues

## Security Best Practices for Users

- Keep Docker and Docker Desktop updated to the latest version
- Do not expose the Docker socket to untrusted containers
- Use Docker Content Trust for image verification
- Review the MCP server source code before running it with elevated privileges
- Never store credentials in Dockerfiles or compose files - use environment variables or Docker secrets
