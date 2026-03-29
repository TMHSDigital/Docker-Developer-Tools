# Contributing to Docker Developer Tools

Thank you for your interest in contributing to Docker Developer Tools. This guide covers everything you need to get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Docker-Developer-Tools.git
   cd Docker-Developer-Tools
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Local Development

### Plugin development

Symlink the repo to your Cursor plugins directory:

**macOS/Linux:**
```bash
ln -s "$(pwd)" ~/.cursor/plugins/docker-developer-tools
```

**Windows (PowerShell as Admin):**
```powershell
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.cursor\plugins\docker-developer-tools" -Target (Get-Location)
```

### MCP server development

```bash
cd mcp-server
npm install
npm run build
npm test
npm run dev  # watch mode with tsx
```

### Running structure tests

```bash
pip install -r requirements-test.txt
pytest tests/ -v --tb=short
```

## Plugin Structure

```
Docker-Developer-Tools/
  .cursor-plugin/
    plugin.json              # Plugin manifest
  skills/
    <skill-name>/
      SKILL.md               # One skill per directory
  rules/
    <rule-name>.mdc           # Rule files
  mcp-server/
    src/
      index.ts               # MCP server entry point
      tools/<tool-name>.ts   # One file per MCP tool
      utils/                 # Shared helpers
```

## Adding a Skill

1. Create a new directory under `skills/` with a kebab-case name
2. Create `SKILL.md` inside that directory
3. Use this template:

```markdown
---
name: your-skill-name
description: One-line description of what this skill does.
---

# Your Skill Title

## Trigger

- When to activate this skill (bullet list)

## Required Inputs

- **Input name** - description of what's needed

## Workflow

1. Step-by-step workflow
2. Include code examples
3. Use practical, copy-pasteable code

## Key References

| Resource | URL |
|----------|-----|
| Docker Docs | https://docs.docker.com/relevant-page/ |

## Example Interaction

**User:** Example question a user might ask

**Agent:** Example response showing how the skill guides the answer

## MCP Usage

Describe which `docker_*` MCP tools this skill uses and how.

## Common Pitfalls

1. Common mistake and how to avoid it
2. Another common issue

## See Also

- Related Skill Name (use relative path: ../skill-name/SKILL.md)
```

### Skill requirements

- `name` in frontmatter must match the directory name
- `description` must be at least 20 characters
- Must include H1 heading
- Must include sections: Trigger, Required Inputs, Workflow, Example Interaction
- Must be at least 50 lines
- All relative links must resolve to existing files

## Adding a Rule

1. Create a `.mdc` file in the `rules/` directory
2. Use this template:

**Scoped rule (triggers on specific file patterns):**

```markdown
---
description: What this rule checks for.
alwaysApply: false
globs:
  - "**/pattern*"
---

# Rule Title

## Patterns to Flag

- What to look for

## What to Do

- How to fix the flagged patterns

## Exceptions

- When the pattern is acceptable
```

**Global rule (always active):**

```markdown
---
description: What this rule checks for.
alwaysApply: true
---

# Rule Title

(body content)
```

### Rule requirements

- Must have `description` and `alwaysApply` in frontmatter
- If `alwaysApply: false`, must include `globs` with at least one pattern
- Must include H1 heading
- Body must be at least 10 lines

## Adding an MCP Tool

1. Create a new `.ts` file in `mcp-server/src/tools/`
2. Follow this pattern:

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execDocker, errorResponse } from "../utils/docker-api.js";

const inputSchema = {
  paramName: z.string().min(1).describe("What this parameter does"),
};

export function register(server: McpServer): void {
  server.tool(
    "docker_toolName",
    "What this tool does",
    inputSchema,
    async (args) => {
      try {
        const output = await execDocker(["command", "args"]);
        const data = JSON.parse(output);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(data, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
```

3. Register the tool in `src/index.ts`
4. Add input validation tests in `src/tools/__tests__/input-validation.test.ts`

## Pull Request Process

1. Ensure all tests pass:
   ```bash
   cd mcp-server && npm run build && npm test
   pytest tests/ -v --tb=short
   ```
2. Update `CHANGELOG.md` with your changes
3. Fill out the PR template completely
4. One approval required for merge

## Release Checklist

When cutting a new version, complete every step in order before merging to `main`:

### 1. Implementation

- [ ] All MCP tools, skills, and rules listed for the milestone in `ROADMAP.md` are implemented
- [ ] Input validation tests added for every new MCP tool (`input-validation.test.ts`)
- [ ] MCP server builds cleanly (`cd mcp-server && npm run build`)
- [ ] All Vitest tests pass (`cd mcp-server && npm test`)
- [ ] All pytest structure tests pass (`pytest tests/ -v --tb=short`)

### 2. Version bump (must be consistent across all files)

- [ ] `.cursor-plugin/plugin.json` - `version` field and tool count in `description`
- [ ] `mcp-server/package.json` - `version` field and `description`
- [ ] `mcp-server/src/index.ts` - `version` in `McpServer` constructor
- [ ] `README.md` - version badge, tool count in tagline, tools table rows
- [ ] `CLAUDE.md` - version, tool count, tool tables, CLI quick reference table
- [ ] `ROADMAP.md` - mark new version `(current)`, previous version `Released`, update Completed list

### 3. Documentation

- [ ] `CHANGELOG.md` - new version section with all Added/Changed/Fixed items and comparison link
- [ ] `docs/index.html` (GitHub Pages):
  - Meta description and `og:description` tool counts
  - Hero version pill
  - Stats counter `data-target` for MCP Tools
  - Tools table (add rows for new tools)
  - Roadmap timeline (shift current marker, update planned items)

### 4. Final validation

- [ ] Re-run all tests after doc changes (some tests check docs consistency)
- [ ] Verify `docs/index.html` renders correctly in a browser

### 5. Ship

- [ ] Commit and push to `main`
- [ ] Create annotated tag: `git tag vX.Y.Z`
- [ ] Push tag: `git push origin vX.Y.Z`
- [ ] Create GitHub release: `gh release create vX.Y.Z --title "vX.Y.Z - Theme" --notes "..."`
- [ ] Update repo description: `gh repo edit --description "...new tool count..."`

## Style Guidelines

- **No em dashes.** Use regular dashes (-) or rewrite the sentence.
- **No hardcoded credentials.** Use environment variables or Docker secrets.
- **Practical examples.** Code should be copy-pasteable and realistic.
- **Concise descriptions.** No filler text.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.
