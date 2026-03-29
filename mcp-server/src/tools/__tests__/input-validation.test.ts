import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("docker_listContainers input validation", () => {
  const schema = z.object({
    all: z.boolean().optional().default(false),
    limit: z.number().int().positive().optional(),
    filter: z.string().optional(),
  });

  it("accepts empty input with defaults", () => {
    const result = schema.parse({});
    expect(result.all).toBe(false);
  });

  it("accepts all=true", () => {
    const result = schema.parse({ all: true });
    expect(result.all).toBe(true);
  });

  it("rejects negative limit", () => {
    expect(() => schema.parse({ limit: -1 })).toThrow();
  });

  it("rejects non-integer limit", () => {
    expect(() => schema.parse({ limit: 1.5 })).toThrow();
  });
});

describe("docker_inspectContainer input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
  });

  it("accepts valid container ID", () => {
    const result = schema.parse({ containerId: "abc123" });
    expect(result.containerId).toBe("abc123");
  });

  it("accepts container name", () => {
    const result = schema.parse({ containerId: "my-container" });
    expect(result.containerId).toBe("my-container");
  });

  it("rejects empty string", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });

  it("rejects missing containerId", () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe("docker_containerLogs input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    tail: z.number().int().positive().optional().default(100),
    since: z.string().optional(),
    timestamps: z.boolean().optional().default(false),
  });

  it("applies default tail of 100", () => {
    const result = schema.parse({ containerId: "test" });
    expect(result.tail).toBe(100);
  });

  it("accepts custom tail value", () => {
    const result = schema.parse({ containerId: "test", tail: 50 });
    expect(result.tail).toBe(50);
  });

  it("rejects zero tail", () => {
    expect(() => schema.parse({ containerId: "test", tail: 0 })).toThrow();
  });

  it("accepts since parameter", () => {
    const result = schema.parse({ containerId: "test", since: "10m" });
    expect(result.since).toBe("10m");
  });
});

describe("docker_inspectImage input validation", () => {
  const schema = z.object({
    imageRef: z.string().min(1),
  });

  it("accepts image name with tag", () => {
    const result = schema.parse({ imageRef: "nginx:alpine" });
    expect(result.imageRef).toBe("nginx:alpine");
  });

  it("accepts image ID", () => {
    const result = schema.parse({ imageRef: "sha256:abc123def456" });
    expect(result.imageRef).toBe("sha256:abc123def456");
  });

  it("rejects empty string", () => {
    expect(() => schema.parse({ imageRef: "" })).toThrow();
  });
});

describe("docker_searchHub input validation", () => {
  const schema = z.object({
    term: z.string().min(1),
    limit: z.number().int().min(1).max(100).optional().default(25),
    filter: z.string().optional(),
  });

  it("accepts search term with defaults", () => {
    const result = schema.parse({ term: "nginx" });
    expect(result.term).toBe("nginx");
    expect(result.limit).toBe(25);
  });

  it("accepts custom limit", () => {
    const result = schema.parse({ term: "postgres", limit: 10 });
    expect(result.limit).toBe(10);
  });

  it("rejects limit over 100", () => {
    expect(() => schema.parse({ term: "nginx", limit: 200 })).toThrow();
  });

  it("rejects limit of 0", () => {
    expect(() => schema.parse({ term: "nginx", limit: 0 })).toThrow();
  });

  it("rejects empty search term", () => {
    expect(() => schema.parse({ term: "" })).toThrow();
  });

  it("accepts filter", () => {
    const result = schema.parse({ term: "nginx", filter: "is-official=true" });
    expect(result.filter).toBe("is-official=true");
  });
});

describe("docker_run input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
    name: z.string().optional(),
    ports: z.array(z.string()).optional(),
    env: z.array(z.string()).optional(),
    volumes: z.array(z.string()).optional(),
    network: z.string().optional(),
    remove: z.boolean().optional().default(false),
    command: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    restart: z.string().optional(),
  });

  it("accepts image only", () => {
    const result = schema.parse({ image: "nginx:alpine" });
    expect(result.image).toBe("nginx:alpine");
    expect(result.remove).toBe(false);
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });

  it("rejects missing image", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("accepts full options", () => {
    const result = schema.parse({
      image: "node:20",
      name: "my-app",
      ports: ["3000:3000"],
      env: ["NODE_ENV=production"],
      volumes: ["data:/app/data"],
      network: "my-net",
      remove: true,
      command: ["node", "server.js"],
      labels: ["env=prod"],
      restart: "unless-stopped",
    });
    expect(result.name).toBe("my-app");
    expect(result.ports).toEqual(["3000:3000"]);
    expect(result.remove).toBe(true);
  });
});

describe("docker_create input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
    name: z.string().optional(),
    ports: z.array(z.string()).optional(),
    env: z.array(z.string()).optional(),
    volumes: z.array(z.string()).optional(),
    network: z.string().optional(),
    command: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    restart: z.string().optional(),
  });

  it("accepts image only", () => {
    const result = schema.parse({ image: "ubuntu:22.04" });
    expect(result.image).toBe("ubuntu:22.04");
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });

  it("accepts name and env", () => {
    const result = schema.parse({
      image: "redis",
      name: "cache",
      env: ["REDIS_PASSWORD=secret"],
    });
    expect(result.name).toBe("cache");
    expect(result.env).toEqual(["REDIS_PASSWORD=secret"]);
  });
});

describe("docker_start input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
  });

  it("accepts container ID", () => {
    const result = schema.parse({ containerId: "abc123" });
    expect(result.containerId).toBe("abc123");
  });

  it("rejects empty string", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });

  it("rejects missing containerId", () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe("docker_stop input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    time: z.number().int().nonnegative().optional(),
  });

  it("accepts containerId only", () => {
    const result = schema.parse({ containerId: "myapp" });
    expect(result.containerId).toBe("myapp");
    expect(result.time).toBeUndefined();
  });

  it("accepts time parameter", () => {
    const result = schema.parse({ containerId: "myapp", time: 30 });
    expect(result.time).toBe(30);
  });

  it("accepts time of 0", () => {
    const result = schema.parse({ containerId: "myapp", time: 0 });
    expect(result.time).toBe(0);
  });

  it("rejects negative time", () => {
    expect(() => schema.parse({ containerId: "myapp", time: -1 })).toThrow();
  });

  it("rejects non-integer time", () => {
    expect(() => schema.parse({ containerId: "myapp", time: 1.5 })).toThrow();
  });
});

describe("docker_restart input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    time: z.number().int().nonnegative().optional(),
  });

  it("accepts containerId only", () => {
    const result = schema.parse({ containerId: "web" });
    expect(result.containerId).toBe("web");
  });

  it("accepts time parameter", () => {
    const result = schema.parse({ containerId: "web", time: 5 });
    expect(result.time).toBe(5);
  });

  it("rejects negative time", () => {
    expect(() => schema.parse({ containerId: "web", time: -5 })).toThrow();
  });
});

describe("docker_kill input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    signal: z.string().optional(),
  });

  it("accepts containerId only", () => {
    const result = schema.parse({ containerId: "abc" });
    expect(result.containerId).toBe("abc");
    expect(result.signal).toBeUndefined();
  });

  it("accepts signal parameter", () => {
    const result = schema.parse({ containerId: "abc", signal: "SIGTERM" });
    expect(result.signal).toBe("SIGTERM");
  });

  it("rejects empty containerId", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });
});

describe("docker_rm input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    force: z.boolean().optional().default(false),
    volumes: z.boolean().optional().default(false),
  });

  it("accepts containerId with defaults", () => {
    const result = schema.parse({ containerId: "old-container" });
    expect(result.containerId).toBe("old-container");
    expect(result.force).toBe(false);
    expect(result.volumes).toBe(false);
  });

  it("accepts force and volumes", () => {
    const result = schema.parse({
      containerId: "stuck",
      force: true,
      volumes: true,
    });
    expect(result.force).toBe(true);
    expect(result.volumes).toBe(true);
  });

  it("rejects missing containerId", () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe("docker_pause input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
  });

  it("accepts container ID", () => {
    const result = schema.parse({ containerId: "running-app" });
    expect(result.containerId).toBe("running-app");
  });

  it("rejects empty string", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });
});

describe("docker_unpause input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
  });

  it("accepts container ID", () => {
    const result = schema.parse({ containerId: "paused-app" });
    expect(result.containerId).toBe("paused-app");
  });

  it("rejects empty string", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });
});

describe("docker_exec input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    command: z.array(z.string()).min(1),
    workdir: z.string().optional(),
    user: z.string().optional(),
    env: z.array(z.string()).optional(),
  });

  it("accepts containerId and command", () => {
    const result = schema.parse({
      containerId: "web",
      command: ["ls", "-la"],
    });
    expect(result.containerId).toBe("web");
    expect(result.command).toEqual(["ls", "-la"]);
  });

  it("rejects empty command array", () => {
    expect(() =>
      schema.parse({ containerId: "web", command: [] }),
    ).toThrow();
  });

  it("rejects missing command", () => {
    expect(() => schema.parse({ containerId: "web" })).toThrow();
  });

  it("accepts workdir, user, and env", () => {
    const result = schema.parse({
      containerId: "web",
      command: ["cat", "/etc/hosts"],
      workdir: "/app",
      user: "node",
      env: ["DEBUG=true"],
    });
    expect(result.workdir).toBe("/app");
    expect(result.user).toBe("node");
    expect(result.env).toEqual(["DEBUG=true"]);
  });
});

describe("docker_pull input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
    platform: z.string().optional(),
    allTags: z.boolean().optional().default(false),
  });

  it("accepts image only", () => {
    const result = schema.parse({ image: "nginx:alpine" });
    expect(result.image).toBe("nginx:alpine");
    expect(result.allTags).toBe(false);
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });

  it("rejects missing image", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("accepts platform option", () => {
    const result = schema.parse({ image: "node:20", platform: "linux/arm64" });
    expect(result.platform).toBe("linux/arm64");
  });

  it("accepts allTags option", () => {
    const result = schema.parse({ image: "nginx", allTags: true });
    expect(result.allTags).toBe(true);
  });
});

describe("docker_push input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
    allTags: z.boolean().optional().default(false),
  });

  it("accepts image only", () => {
    const result = schema.parse({ image: "myregistry.com/myapp:v1.0" });
    expect(result.image).toBe("myregistry.com/myapp:v1.0");
    expect(result.allTags).toBe(false);
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });

  it("accepts allTags option", () => {
    const result = schema.parse({ image: "myapp", allTags: true });
    expect(result.allTags).toBe(true);
  });
});

describe("docker_build input validation", () => {
  const schema = z.object({
    context: z.string().min(1),
    tag: z.array(z.string()).optional(),
    file: z.string().optional(),
    buildArgs: z.array(z.string()).optional(),
    target: z.string().optional(),
    noCache: z.boolean().optional().default(false),
    pull: z.boolean().optional().default(false),
    labels: z.array(z.string()).optional(),
    platform: z.string().optional(),
  });

  it("accepts context only", () => {
    const result = schema.parse({ context: "." });
    expect(result.context).toBe(".");
    expect(result.noCache).toBe(false);
    expect(result.pull).toBe(false);
  });

  it("rejects empty context", () => {
    expect(() => schema.parse({ context: "" })).toThrow();
  });

  it("rejects missing context", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("accepts full options", () => {
    const result = schema.parse({
      context: "./app",
      tag: ["myapp:latest", "myapp:v1.0"],
      file: "docker/Dockerfile.prod",
      buildArgs: ["NODE_ENV=production"],
      target: "runtime",
      noCache: true,
      pull: true,
      labels: ["version=1.0"],
      platform: "linux/amd64",
    });
    expect(result.tag).toEqual(["myapp:latest", "myapp:v1.0"]);
    expect(result.file).toBe("docker/Dockerfile.prod");
    expect(result.target).toBe("runtime");
    expect(result.noCache).toBe(true);
  });
});

describe("docker_tag input validation", () => {
  const schema = z.object({
    sourceImage: z.string().min(1),
    targetImage: z.string().min(1),
  });

  it("accepts source and target", () => {
    const result = schema.parse({
      sourceImage: "myapp:latest",
      targetImage: "registry.example.com/myapp:v2.0",
    });
    expect(result.sourceImage).toBe("myapp:latest");
    expect(result.targetImage).toBe("registry.example.com/myapp:v2.0");
  });

  it("rejects empty sourceImage", () => {
    expect(() =>
      schema.parse({ sourceImage: "", targetImage: "foo:bar" }),
    ).toThrow();
  });

  it("rejects empty targetImage", () => {
    expect(() =>
      schema.parse({ sourceImage: "foo:bar", targetImage: "" }),
    ).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ sourceImage: "foo" })).toThrow();
  });
});

describe("docker_rmi input validation", () => {
  const schema = z.object({
    images: z.array(z.string().min(1)).min(1),
    force: z.boolean().optional().default(false),
    noPrune: z.boolean().optional().default(false),
  });

  it("accepts single image", () => {
    const result = schema.parse({ images: ["nginx:old"] });
    expect(result.images).toEqual(["nginx:old"]);
    expect(result.force).toBe(false);
    expect(result.noPrune).toBe(false);
  });

  it("accepts multiple images", () => {
    const result = schema.parse({ images: ["img1:v1", "img2:v2"] });
    expect(result.images).toHaveLength(2);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ images: [] })).toThrow();
  });

  it("rejects empty string in array", () => {
    expect(() => schema.parse({ images: [""] })).toThrow();
  });

  it("accepts force and noPrune", () => {
    const result = schema.parse({
      images: ["abc123"],
      force: true,
      noPrune: true,
    });
    expect(result.force).toBe(true);
    expect(result.noPrune).toBe(true);
  });
});

describe("docker_commit input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    repository: z.string().optional(),
    tag: z.string().optional(),
    message: z.string().optional(),
    author: z.string().optional(),
    pause: z.boolean().optional().default(true),
  });

  it("accepts containerId only", () => {
    const result = schema.parse({ containerId: "my-container" });
    expect(result.containerId).toBe("my-container");
    expect(result.pause).toBe(true);
  });

  it("rejects empty containerId", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });

  it("rejects missing containerId", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("accepts full options", () => {
    const result = schema.parse({
      containerId: "webapp",
      repository: "myapp",
      tag: "v1.0",
      message: "Added config files",
      author: "Dev <dev@example.com>",
      pause: false,
    });
    expect(result.repository).toBe("myapp");
    expect(result.tag).toBe("v1.0");
    expect(result.message).toBe("Added config files");
    expect(result.pause).toBe(false);
  });
});

describe("docker_save input validation", () => {
  const schema = z.object({
    images: z.array(z.string().min(1)).min(1),
    output: z.string().min(1),
  });

  it("accepts images and output", () => {
    const result = schema.parse({
      images: ["myapp:v1"],
      output: "./myapp.tar",
    });
    expect(result.images).toEqual(["myapp:v1"]);
    expect(result.output).toBe("./myapp.tar");
  });

  it("accepts multiple images", () => {
    const result = schema.parse({
      images: ["myapp:v1", "myapp:v2"],
      output: "./images.tar",
    });
    expect(result.images).toHaveLength(2);
  });

  it("rejects empty images array", () => {
    expect(() =>
      schema.parse({ images: [], output: "./out.tar" }),
    ).toThrow();
  });

  it("rejects empty output", () => {
    expect(() =>
      schema.parse({ images: ["myapp:v1"], output: "" }),
    ).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ images: ["foo"] })).toThrow();
  });
});

describe("docker_load input validation", () => {
  const schema = z.object({
    input: z.string().min(1),
  });

  it("accepts input path", () => {
    const result = schema.parse({ input: "./myapp.tar" });
    expect(result.input).toBe("./myapp.tar");
  });

  it("rejects empty input", () => {
    expect(() => schema.parse({ input: "" })).toThrow();
  });

  it("rejects missing input", () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe("docker_composeUp input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
    build: z.boolean().optional().default(false),
    pull: z.string().optional(),
    forceRecreate: z.boolean().optional().default(false),
    removeOrphans: z.boolean().optional().default(false),
    profiles: z.array(z.string()).optional(),
  });

  it("accepts empty (all defaults)", () => {
    const result = schema.parse({});
    expect(result.build).toBe(false);
    expect(result.forceRecreate).toBe(false);
  });

  it("accepts file and services", () => {
    const result = schema.parse({
      file: "docker-compose.prod.yml",
      services: ["web", "db"],
    });
    expect(result.file).toBe("docker-compose.prod.yml");
    expect(result.services).toEqual(["web", "db"]);
  });

  it("accepts full options", () => {
    const result = schema.parse({
      file: "compose.yml",
      projectDir: "/app",
      services: ["api"],
      build: true,
      pull: "always",
      forceRecreate: true,
      removeOrphans: true,
      profiles: ["debug"],
    });
    expect(result.build).toBe(true);
    expect(result.pull).toBe("always");
    expect(result.profiles).toEqual(["debug"]);
  });
});

describe("docker_composeDown input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    removeVolumes: z.boolean().optional().default(false),
    removeImages: z.string().optional(),
    timeout: z.number().optional(),
  });

  it("accepts empty (all defaults)", () => {
    const result = schema.parse({});
    expect(result.removeVolumes).toBe(false);
  });

  it("accepts removeVolumes and removeImages", () => {
    const result = schema.parse({
      removeVolumes: true,
      removeImages: "all",
      timeout: 30,
    });
    expect(result.removeVolumes).toBe(true);
    expect(result.removeImages).toBe("all");
    expect(result.timeout).toBe(30);
  });
});

describe("docker_composePs input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
    all: z.boolean().optional().default(false),
  });

  it("accepts empty", () => {
    const result = schema.parse({});
    expect(result.all).toBe(false);
  });

  it("accepts services and all flag", () => {
    const result = schema.parse({
      services: ["web"],
      all: true,
    });
    expect(result.services).toEqual(["web"]);
    expect(result.all).toBe(true);
  });
});

describe("docker_composeLogs input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
    tail: z.number().optional(),
    since: z.string().optional(),
    timestamps: z.boolean().optional().default(false),
  });

  it("accepts empty", () => {
    const result = schema.parse({});
    expect(result.timestamps).toBe(false);
  });

  it("accepts tail, since, and timestamps", () => {
    const result = schema.parse({
      services: ["api", "worker"],
      tail: 100,
      since: "10m",
      timestamps: true,
    });
    expect(result.tail).toBe(100);
    expect(result.since).toBe("10m");
    expect(result.timestamps).toBe(true);
  });
});

describe("docker_composeBuild input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
    noCache: z.boolean().optional().default(false),
    pull: z.boolean().optional().default(false),
  });

  it("accepts empty", () => {
    const result = schema.parse({});
    expect(result.noCache).toBe(false);
    expect(result.pull).toBe(false);
  });

  it("accepts noCache and pull", () => {
    const result = schema.parse({
      services: ["app"],
      noCache: true,
      pull: true,
    });
    expect(result.noCache).toBe(true);
    expect(result.pull).toBe(true);
  });
});

describe("docker_composeRestart input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
    timeout: z.number().optional(),
  });

  it("accepts empty", () => {
    const result = schema.parse({});
    expect(result.timeout).toBeUndefined();
  });

  it("accepts services and timeout", () => {
    const result = schema.parse({
      services: ["web", "api"],
      timeout: 30,
    });
    expect(result.services).toEqual(["web", "api"]);
    expect(result.timeout).toBe(30);
  });
});

describe("docker_composePull input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
  });

  it("accepts empty", () => {
    const result = schema.parse({});
    expect(result.services).toBeUndefined();
  });

  it("accepts services", () => {
    const result = schema.parse({ services: ["db", "cache"] });
    expect(result.services).toEqual(["db", "cache"]);
  });
});

describe("docker_composeExec input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    service: z.string().min(1),
    command: z.array(z.string()).min(1),
    user: z.string().optional(),
    workdir: z.string().optional(),
    env: z.array(z.string()).optional(),
  });

  it("accepts service and command", () => {
    const result = schema.parse({
      service: "web",
      command: ["ls", "-la"],
    });
    expect(result.service).toBe("web");
    expect(result.command).toEqual(["ls", "-la"]);
  });

  it("rejects empty service", () => {
    expect(() =>
      schema.parse({ service: "", command: ["ls"] }),
    ).toThrow();
  });

  it("rejects empty command array", () => {
    expect(() =>
      schema.parse({ service: "web", command: [] }),
    ).toThrow();
  });

  it("rejects missing service", () => {
    expect(() => schema.parse({ command: ["ls"] })).toThrow();
  });

  it("accepts user, workdir, and env", () => {
    const result = schema.parse({
      service: "app",
      command: ["bash"],
      user: "root",
      workdir: "/app",
      env: ["DEBUG=1"],
    });
    expect(result.user).toBe("root");
    expect(result.workdir).toBe("/app");
    expect(result.env).toEqual(["DEBUG=1"]);
  });
});

describe("docker_volumeCreate input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    driver: z.string().optional(),
    labels: z.array(z.string()).optional(),
    driverOpts: z.array(z.string()).optional(),
  });

  it("accepts name only", () => {
    const result = schema.parse({ name: "mydata" });
    expect(result.name).toBe("mydata");
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "" })).toThrow();
  });

  it("accepts driver, labels, and opts", () => {
    const result = schema.parse({
      name: "vol1",
      driver: "local",
      labels: ["env=prod"],
      driverOpts: ["type=nfs"],
    });
    expect(result.driver).toBe("local");
    expect(result.labels).toEqual(["env=prod"]);
  });
});

describe("docker_volumeRm input validation", () => {
  const schema = z.object({
    volumes: z.array(z.string()).min(1),
    force: z.boolean().optional().default(false),
  });

  it("accepts volume names", () => {
    const result = schema.parse({ volumes: ["vol1", "vol2"] });
    expect(result.volumes).toEqual(["vol1", "vol2"]);
    expect(result.force).toBe(false);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ volumes: [] })).toThrow();
  });

  it("accepts force flag", () => {
    const result = schema.parse({ volumes: ["x"], force: true });
    expect(result.force).toBe(true);
  });
});

describe("docker_volumeInspect input validation", () => {
  const schema = z.object({
    volume: z.string().min(1),
  });

  it("accepts volume name", () => {
    const result = schema.parse({ volume: "mydata" });
    expect(result.volume).toBe("mydata");
  });

  it("rejects empty volume", () => {
    expect(() => schema.parse({ volume: "" })).toThrow();
  });
});

describe("docker_volumePrune input validation", () => {
  const schema = z.object({
    all: z.boolean().optional().default(false),
    filter: z.string().optional(),
  });

  it("accepts defaults", () => {
    const result = schema.parse({});
    expect(result.all).toBe(false);
  });

  it("accepts all and filter", () => {
    const result = schema.parse({ all: true, filter: "label=keep" });
    expect(result.all).toBe(true);
    expect(result.filter).toBe("label=keep");
  });
});

describe("docker_networkCreate input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    driver: z.string().optional(),
    subnet: z.string().optional(),
    gateway: z.string().optional(),
    ipRange: z.string().optional(),
    internal: z.boolean().optional().default(false),
    labels: z.array(z.string()).optional(),
  });

  it("accepts name only", () => {
    const result = schema.parse({ name: "mynet" });
    expect(result.name).toBe("mynet");
    expect(result.internal).toBe(false);
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "" })).toThrow();
  });

  it("accepts full options", () => {
    const result = schema.parse({
      name: "backend",
      driver: "bridge",
      subnet: "172.28.0.0/16",
      gateway: "172.28.0.1",
      ipRange: "172.28.5.0/24",
      internal: true,
      labels: ["env=dev"],
    });
    expect(result.driver).toBe("bridge");
    expect(result.subnet).toBe("172.28.0.0/16");
    expect(result.internal).toBe(true);
  });
});

describe("docker_networkRm input validation", () => {
  const schema = z.object({
    networks: z.array(z.string()).min(1),
    force: z.boolean().optional().default(false),
  });

  it("accepts network names", () => {
    const result = schema.parse({ networks: ["net1"] });
    expect(result.networks).toEqual(["net1"]);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ networks: [] })).toThrow();
  });
});

describe("docker_networkConnect input validation", () => {
  const schema = z.object({
    network: z.string().min(1),
    container: z.string().min(1),
    ip: z.string().optional(),
    alias: z.array(z.string()).optional(),
  });

  it("accepts network and container", () => {
    const result = schema.parse({ network: "mynet", container: "web" });
    expect(result.network).toBe("mynet");
    expect(result.container).toBe("web");
  });

  it("rejects empty network", () => {
    expect(() => schema.parse({ network: "", container: "web" })).toThrow();
  });

  it("rejects empty container", () => {
    expect(() => schema.parse({ network: "mynet", container: "" })).toThrow();
  });

  it("accepts ip and alias", () => {
    const result = schema.parse({
      network: "mynet",
      container: "web",
      ip: "172.28.0.10",
      alias: ["webapp"],
    });
    expect(result.ip).toBe("172.28.0.10");
    expect(result.alias).toEqual(["webapp"]);
  });
});

describe("docker_networkDisconnect input validation", () => {
  const schema = z.object({
    network: z.string().min(1),
    container: z.string().min(1),
    force: z.boolean().optional().default(false),
  });

  it("accepts network and container", () => {
    const result = schema.parse({ network: "mynet", container: "web" });
    expect(result.force).toBe(false);
  });

  it("accepts force flag", () => {
    const result = schema.parse({ network: "mynet", container: "web", force: true });
    expect(result.force).toBe(true);
  });
});

describe("docker_networkInspect input validation", () => {
  const schema = z.object({
    network: z.string().min(1),
  });

  it("accepts network name", () => {
    const result = schema.parse({ network: "bridge" });
    expect(result.network).toBe("bridge");
  });

  it("rejects empty network", () => {
    expect(() => schema.parse({ network: "" })).toThrow();
  });
});

describe("docker_networkPrune input validation", () => {
  const schema = z.object({
    filter: z.string().optional(),
  });

  it("accepts empty", () => {
    const result = schema.parse({});
    expect(result.filter).toBeUndefined();
  });

  it("accepts filter", () => {
    const result = schema.parse({ filter: "until=24h" });
    expect(result.filter).toBe("until=24h");
  });
});

describe("docker_systemPrune input validation", () => {
  const schema = z.object({
    all: z.boolean().optional().default(false),
    volumes: z.boolean().optional().default(false),
  });

  it("accepts defaults", () => {
    const result = schema.parse({});
    expect(result.all).toBe(false);
    expect(result.volumes).toBe(false);
  });

  it("accepts all and volumes", () => {
    const result = schema.parse({ all: true, volumes: true });
    expect(result.all).toBe(true);
    expect(result.volumes).toBe(true);
  });
});

describe("docker_containerPrune input validation", () => {
  const schema = z.object({
    filter: z.string().optional(),
  });

  it("accepts empty", () => {
    const result = schema.parse({});
    expect(result.filter).toBeUndefined();
  });

  it("accepts filter", () => {
    const result = schema.parse({ filter: "until=24h" });
    expect(result.filter).toBe("until=24h");
  });
});

describe("docker_imagePrune input validation", () => {
  const schema = z.object({
    all: z.boolean().optional().default(false),
    filter: z.string().optional(),
  });

  it("accepts defaults", () => {
    const result = schema.parse({});
    expect(result.all).toBe(false);
  });

  it("accepts all and filter", () => {
    const result = schema.parse({ all: true, filter: "until=24h" });
    expect(result.all).toBe(true);
    expect(result.filter).toBe("until=24h");
  });
});

// --- v0.6.0: Advanced and Observability ---

describe("docker_cp input validation", () => {
  const schema = z.object({
    source: z.string().min(1),
    destination: z.string().min(1),
    archive: z.boolean().optional().default(false),
    followLink: z.boolean().optional().default(false),
  });

  it("requires source and destination", () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ source: "container:/app" })).toThrow();
  });

  it("rejects empty strings", () => {
    expect(() =>
      schema.parse({ source: "", destination: "/tmp" }),
    ).toThrow();
  });

  it("accepts valid paths", () => {
    const result = schema.parse({
      source: "mycontainer:/app/logs",
      destination: "./logs",
    });
    expect(result.source).toBe("mycontainer:/app/logs");
    expect(result.destination).toBe("./logs");
    expect(result.archive).toBe(false);
    expect(result.followLink).toBe(false);
  });

  it("accepts optional flags", () => {
    const result = schema.parse({
      source: "/tmp/config.json",
      destination: "mycontainer:/app/config.json",
      archive: true,
      followLink: true,
    });
    expect(result.archive).toBe(true);
    expect(result.followLink).toBe(true);
  });
});

describe("docker_stats input validation", () => {
  const schema = z.object({
    containers: z.array(z.string()).optional(),
    noStream: z.boolean().optional().default(true),
  });

  it("accepts empty for all containers", () => {
    const result = schema.parse({});
    expect(result.containers).toBeUndefined();
    expect(result.noStream).toBe(true);
  });

  it("accepts container list", () => {
    const result = schema.parse({ containers: ["web", "db"] });
    expect(result.containers).toEqual(["web", "db"]);
  });

  it("accepts noStream false", () => {
    const result = schema.parse({ noStream: false });
    expect(result.noStream).toBe(false);
  });
});

describe("docker_top input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    psArgs: z.string().optional(),
  });

  it("requires containerId", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty containerId", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });

  it("accepts containerId only", () => {
    const result = schema.parse({ containerId: "myapp" });
    expect(result.containerId).toBe("myapp");
    expect(result.psArgs).toBeUndefined();
  });

  it("accepts psArgs", () => {
    const result = schema.parse({ containerId: "myapp", psArgs: "aux" });
    expect(result.psArgs).toBe("aux");
  });
});

describe("docker_events input validation", () => {
  const schema = z.object({
    since: z.string().optional(),
    until: z.string().optional(),
    filter: z.array(z.string()).optional(),
  });

  it("accepts empty", () => {
    const result = schema.parse({});
    expect(result.since).toBeUndefined();
    expect(result.until).toBeUndefined();
    expect(result.filter).toBeUndefined();
  });

  it("accepts since and until", () => {
    const result = schema.parse({ since: "10m", until: "0s" });
    expect(result.since).toBe("10m");
    expect(result.until).toBe("0s");
  });

  it("accepts filters", () => {
    const result = schema.parse({
      filter: ["type=container", "event=start"],
    });
    expect(result.filter).toEqual(["type=container", "event=start"]);
  });
});

describe("docker_update input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    cpus: z.number().optional(),
    memory: z.string().optional(),
    memorySwap: z.string().optional(),
    cpuShares: z.number().optional(),
    restartPolicy: z.string().optional(),
  });

  it("requires containerId", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty containerId", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });

  it("accepts containerId only", () => {
    const result = schema.parse({ containerId: "myapp" });
    expect(result.containerId).toBe("myapp");
  });

  it("accepts all resource options", () => {
    const result = schema.parse({
      containerId: "myapp",
      cpus: 1.5,
      memory: "512m",
      memorySwap: "1g",
      cpuShares: 512,
      restartPolicy: "unless-stopped",
    });
    expect(result.cpus).toBe(1.5);
    expect(result.memory).toBe("512m");
    expect(result.memorySwap).toBe("1g");
    expect(result.cpuShares).toBe(512);
    expect(result.restartPolicy).toBe("unless-stopped");
  });
});

describe("docker_wait input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
  });

  it("requires containerId", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty containerId", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });

  it("accepts valid containerId", () => {
    const result = schema.parse({ containerId: "batch-job-1" });
    expect(result.containerId).toBe("batch-job-1");
  });
});

// ── v0.7.0 Buildx and Manifest tools ──────────────────────────────

describe("docker_buildxBuild input validation", () => {
  const schema = z.object({
    context: z.string().min(1),
    tag: z.array(z.string()).optional(),
    file: z.string().optional(),
    platform: z.array(z.string()).optional(),
    builder: z.string().optional(),
    buildArgs: z.array(z.string()).optional(),
    target: z.string().optional(),
    noCache: z.boolean().optional().default(false),
    pull: z.boolean().optional().default(false),
    push: z.boolean().optional().default(false),
    load: z.boolean().optional().default(false),
    cacheFrom: z.array(z.string()).optional(),
    cacheTo: z.array(z.string()).optional(),
    provenance: z.boolean().optional(),
    labels: z.array(z.string()).optional(),
  });

  it("requires context", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty context", () => {
    expect(() => schema.parse({ context: "" })).toThrow();
  });

  it("accepts minimal context only", () => {
    const result = schema.parse({ context: "." });
    expect(result.context).toBe(".");
    expect(result.noCache).toBe(false);
    expect(result.push).toBe(false);
    expect(result.load).toBe(false);
  });

  it("accepts multi-platform build with all options", () => {
    const result = schema.parse({
      context: "./app",
      tag: ["myapp:latest", "myapp:v1.0"],
      platform: ["linux/amd64", "linux/arm64"],
      builder: "mybuilder",
      buildArgs: ["NODE_ENV=production"],
      target: "runtime",
      noCache: true,
      push: true,
      cacheFrom: ["type=registry,ref=myapp:cache"],
      cacheTo: ["type=registry,ref=myapp:cache"],
      provenance: true,
      labels: ["version=1.0"],
    });
    expect(result.platform).toEqual(["linux/amd64", "linux/arm64"]);
    expect(result.push).toBe(true);
    expect(result.provenance).toBe(true);
  });
});

describe("docker_buildxLs input validation", () => {
  const schema = z.object({});

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });
});

describe("docker_buildxCreate input validation", () => {
  const schema = z.object({
    name: z.string().optional(),
    driver: z.string().optional(),
    use: z.boolean().optional().default(false),
    platform: z.array(z.string()).optional(),
    buildkitdFlags: z.string().optional(),
    driverOpts: z.array(z.string()).optional(),
  });

  it("accepts empty input (all optional)", () => {
    const result = schema.parse({});
    expect(result.use).toBe(false);
  });

  it("accepts full configuration", () => {
    const result = schema.parse({
      name: "multiarch",
      driver: "docker-container",
      use: true,
      platform: ["linux/amd64", "linux/arm64"],
      driverOpts: ["network=host"],
    });
    expect(result.name).toBe("multiarch");
    expect(result.driver).toBe("docker-container");
    expect(result.use).toBe(true);
  });
});

describe("docker_buildxRm input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    force: z.boolean().optional().default(false),
    allInactive: z.boolean().optional().default(false),
  });

  it("requires name", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "" })).toThrow();
  });

  it("accepts name only", () => {
    const result = schema.parse({ name: "old-builder" });
    expect(result.name).toBe("old-builder");
    expect(result.force).toBe(false);
  });

  it("accepts force and allInactive", () => {
    const result = schema.parse({ name: "old-builder", force: true, allInactive: true });
    expect(result.force).toBe(true);
    expect(result.allInactive).toBe(true);
  });
});

describe("docker_buildxInspect input validation", () => {
  const schema = z.object({
    name: z.string().optional(),
    bootstrap: z.boolean().optional().default(false),
  });

  it("accepts empty input (defaults to current builder)", () => {
    const result = schema.parse({});
    expect(result.bootstrap).toBe(false);
  });

  it("accepts name with bootstrap", () => {
    const result = schema.parse({ name: "mybuilder", bootstrap: true });
    expect(result.name).toBe("mybuilder");
    expect(result.bootstrap).toBe(true);
  });
});

describe("docker_buildxUse input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    global: z.boolean().optional().default(false),
    setDefault: z.boolean().optional().default(false),
  });

  it("requires name", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "" })).toThrow();
  });

  it("accepts name only", () => {
    const result = schema.parse({ name: "multiarch" });
    expect(result.name).toBe("multiarch");
    expect(result.global).toBe(false);
  });

  it("accepts global flag", () => {
    const result = schema.parse({ name: "multiarch", global: true });
    expect(result.global).toBe(true);
  });
});

describe("docker_buildxImagetools input validation", () => {
  const schema = z.object({
    action: z.enum(["inspect", "create"]),
    sources: z.array(z.string()).min(1),
    tag: z.array(z.string()).optional(),
    dryRun: z.boolean().optional().default(false),
  });

  it("requires action and sources", () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ action: "inspect" })).toThrow();
  });

  it("rejects empty sources", () => {
    expect(() => schema.parse({ action: "inspect", sources: [] })).toThrow();
  });

  it("rejects invalid action", () => {
    expect(() => schema.parse({ action: "delete", sources: ["img"] })).toThrow();
  });

  it("accepts inspect action", () => {
    const result = schema.parse({ action: "inspect", sources: ["myapp:latest"] });
    expect(result.action).toBe("inspect");
    expect(result.sources).toEqual(["myapp:latest"]);
  });

  it("accepts create action with tags", () => {
    const result = schema.parse({
      action: "create",
      sources: ["myapp:amd64", "myapp:arm64"],
      tag: ["myapp:latest"],
      dryRun: true,
    });
    expect(result.action).toBe("create");
    expect(result.tag).toEqual(["myapp:latest"]);
    expect(result.dryRun).toBe(true);
  });
});

describe("docker_builderPrune input validation", () => {
  const schema = z.object({
    all: z.boolean().optional().default(false),
    filter: z.string().optional(),
    keepStorage: z.string().optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.all).toBe(false);
  });

  it("accepts all options", () => {
    const result = schema.parse({
      all: true,
      filter: "until=24h",
      keepStorage: "10GB",
    });
    expect(result.all).toBe(true);
    expect(result.filter).toBe("until=24h");
    expect(result.keepStorage).toBe("10GB");
  });
});

describe("docker_manifestCreate input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    images: z.array(z.string()).min(1),
    amend: z.boolean().optional().default(false),
  });

  it("requires name and images", () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ name: "myapp:latest" })).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "", images: ["img1"] })).toThrow();
  });

  it("rejects empty images array", () => {
    expect(() => schema.parse({ name: "myapp:latest", images: [] })).toThrow();
  });

  it("accepts valid manifest creation", () => {
    const result = schema.parse({
      name: "myregistry/myapp:latest",
      images: ["myregistry/myapp:amd64", "myregistry/myapp:arm64"],
    });
    expect(result.name).toBe("myregistry/myapp:latest");
    expect(result.images).toHaveLength(2);
    expect(result.amend).toBe(false);
  });

  it("accepts amend flag", () => {
    const result = schema.parse({
      name: "myapp:latest",
      images: ["myapp:s390x"],
      amend: true,
    });
    expect(result.amend).toBe(true);
  });
});

describe("docker_manifestInspect input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    verbose: z.boolean().optional().default(false),
  });

  it("requires name", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "" })).toThrow();
  });

  it("accepts name only", () => {
    const result = schema.parse({ name: "myapp:latest" });
    expect(result.name).toBe("myapp:latest");
    expect(result.verbose).toBe(false);
  });

  it("accepts verbose flag", () => {
    const result = schema.parse({ name: "myapp:latest", verbose: true });
    expect(result.verbose).toBe(true);
  });
});

describe("docker_manifestAnnotate input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    image: z.string().min(1),
    os: z.string().optional(),
    arch: z.string().optional(),
    variant: z.string().optional(),
    osFeatures: z.array(z.string()).optional(),
  });

  it("requires name and image", () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ name: "myapp:latest" })).toThrow();
  });

  it("rejects empty name or image", () => {
    expect(() => schema.parse({ name: "", image: "img" })).toThrow();
    expect(() => schema.parse({ name: "list", image: "" })).toThrow();
  });

  it("accepts name and image only", () => {
    const result = schema.parse({ name: "myapp:latest", image: "myapp:arm64" });
    expect(result.name).toBe("myapp:latest");
    expect(result.image).toBe("myapp:arm64");
  });

  it("accepts full platform annotation", () => {
    const result = schema.parse({
      name: "myapp:latest",
      image: "myapp:armv7",
      os: "linux",
      arch: "arm",
      variant: "v7",
    });
    expect(result.os).toBe("linux");
    expect(result.arch).toBe("arm");
    expect(result.variant).toBe("v7");
  });
});

describe("docker_manifestPush input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    purge: z.boolean().optional().default(false),
  });

  it("requires name", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "" })).toThrow();
  });

  it("accepts name only", () => {
    const result = schema.parse({ name: "myapp:latest" });
    expect(result.name).toBe("myapp:latest");
    expect(result.purge).toBe(false);
  });

  it("accepts purge flag", () => {
    const result = schema.parse({ name: "myapp:latest", purge: true });
    expect(result.purge).toBe(true);
  });
});

describe("docker_manifestRm input validation", () => {
  const schema = z.object({
    names: z.array(z.string()).min(1),
  });

  it("requires names", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty names array", () => {
    expect(() => schema.parse({ names: [] })).toThrow();
  });

  it("accepts single name", () => {
    const result = schema.parse({ names: ["myapp:latest"] });
    expect(result.names).toEqual(["myapp:latest"]);
  });

  it("accepts multiple names", () => {
    const result = schema.parse({ names: ["myapp:latest", "myapp:v1.0"] });
    expect(result.names).toHaveLength(2);
  });
});
