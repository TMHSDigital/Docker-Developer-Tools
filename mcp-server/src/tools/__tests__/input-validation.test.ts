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

// ── v0.8.0 Compose Completeness ──

describe("docker_composeConfig input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    format: z.enum(["yaml", "json"]).optional(),
    services: z.array(z.string()).optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });

  it("accepts format option", () => {
    const result = schema.parse({ format: "json" });
    expect(result.format).toBe("json");
  });

  it("rejects invalid format", () => {
    expect(() => schema.parse({ format: "xml" })).toThrow();
  });

  it("accepts services filter", () => {
    const result = schema.parse({ services: ["web", "db"] });
    expect(result.services).toEqual(["web", "db"]);
  });

  it("accepts file and projectDir", () => {
    const result = schema.parse({ file: "docker-compose.prod.yml", projectDir: "/app" });
    expect(result.file).toBe("docker-compose.prod.yml");
    expect(result.projectDir).toBe("/app");
  });
});

describe("docker_composeCp input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    source: z.string().min(1),
    destination: z.string().min(1),
    archive: z.boolean().optional().default(false),
    index: z.number().optional(),
  });

  it("requires source and destination", () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ source: "web:/app" })).toThrow();
  });

  it("rejects empty source", () => {
    expect(() => schema.parse({ source: "", destination: "./local" })).toThrow();
  });

  it("accepts valid copy spec", () => {
    const result = schema.parse({ source: "web:/app/data", destination: "./backup" });
    expect(result.source).toBe("web:/app/data");
    expect(result.archive).toBe(false);
  });

  it("accepts archive and index", () => {
    const result = schema.parse({ source: "./file.txt", destination: "web:/tmp", archive: true, index: 2 });
    expect(result.archive).toBe(true);
    expect(result.index).toBe(2);
  });
});

describe("docker_composeCreate input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
    build: z.boolean().optional().default(false),
    forceRecreate: z.boolean().optional().default(false),
    pull: z.string().optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.build).toBe(false);
    expect(result.forceRecreate).toBe(false);
  });

  it("accepts build and forceRecreate", () => {
    const result = schema.parse({ build: true, forceRecreate: true });
    expect(result.build).toBe(true);
    expect(result.forceRecreate).toBe(true);
  });

  it("accepts pull policy", () => {
    const result = schema.parse({ pull: "always" });
    expect(result.pull).toBe("always");
  });

  it("accepts services list", () => {
    const result = schema.parse({ services: ["web", "api"] });
    expect(result.services).toEqual(["web", "api"]);
  });
});

describe("docker_composeEvents input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });

  it("accepts services filter", () => {
    const result = schema.parse({ services: ["web"] });
    expect(result.services).toEqual(["web"]);
  });

  it("accepts file option", () => {
    const result = schema.parse({ file: "compose.yml" });
    expect(result.file).toBe("compose.yml");
  });
});

describe("docker_composeImages input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    format: z.string().optional().default("json"),
  });

  it("defaults format to json", () => {
    const result = schema.parse({});
    expect(result.format).toBe("json");
  });

  it("accepts custom format", () => {
    const result = schema.parse({ format: "table" });
    expect(result.format).toBe("table");
  });

  it("accepts file option", () => {
    const result = schema.parse({ file: "docker-compose.yml" });
    expect(result.file).toBe("docker-compose.yml");
  });
});

describe("docker_composeKill input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
    signal: z.string().optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });

  it("accepts signal option", () => {
    const result = schema.parse({ signal: "SIGKILL" });
    expect(result.signal).toBe("SIGKILL");
  });

  it("accepts services with signal", () => {
    const result = schema.parse({ services: ["web"], signal: "SIGTERM" });
    expect(result.services).toEqual(["web"]);
    expect(result.signal).toBe("SIGTERM");
  });
});

describe("docker_composeLs input validation", () => {
  const schema = z.object({
    all: z.boolean().optional().default(false),
    format: z.string().optional().default("json"),
    filter: z.string().optional(),
  });

  it("defaults all to false and format to json", () => {
    const result = schema.parse({});
    expect(result.all).toBe(false);
    expect(result.format).toBe("json");
  });

  it("accepts all flag", () => {
    const result = schema.parse({ all: true });
    expect(result.all).toBe(true);
  });

  it("accepts filter", () => {
    const result = schema.parse({ filter: "status=running" });
    expect(result.filter).toBe("status=running");
  });
});

describe("docker_composePause input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });

  it("accepts services list", () => {
    const result = schema.parse({ services: ["web", "db"] });
    expect(result.services).toEqual(["web", "db"]);
  });
});

describe("docker_composeUnpause input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });

  it("accepts services list", () => {
    const result = schema.parse({ services: ["web"] });
    expect(result.services).toEqual(["web"]);
  });
});

describe("docker_composePort input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    service: z.string().min(1),
    privatePort: z.number(),
    protocol: z.enum(["tcp", "udp"]).optional(),
  });

  it("requires service and privatePort", () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ service: "web" })).toThrow();
  });

  it("rejects empty service", () => {
    expect(() => schema.parse({ service: "", privatePort: 80 })).toThrow();
  });

  it("accepts valid input", () => {
    const result = schema.parse({ service: "web", privatePort: 80 });
    expect(result.service).toBe("web");
    expect(result.privatePort).toBe(80);
  });

  it("accepts protocol option", () => {
    const result = schema.parse({ service: "web", privatePort: 53, protocol: "udp" });
    expect(result.protocol).toBe("udp");
  });

  it("rejects invalid protocol", () => {
    expect(() => schema.parse({ service: "web", privatePort: 80, protocol: "sctp" })).toThrow();
  });
});

describe("docker_composeRm input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
    volumes: z.boolean().optional().default(false),
    stop: z.boolean().optional().default(false),
  });

  it("defaults volumes and stop to false", () => {
    const result = schema.parse({});
    expect(result.volumes).toBe(false);
    expect(result.stop).toBe(false);
  });

  it("accepts stop and volumes flags", () => {
    const result = schema.parse({ stop: true, volumes: true });
    expect(result.stop).toBe(true);
    expect(result.volumes).toBe(true);
  });

  it("accepts services list", () => {
    const result = schema.parse({ services: ["web"] });
    expect(result.services).toEqual(["web"]);
  });
});

describe("docker_composeRun input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    service: z.string().min(1),
    command: z.array(z.string()).optional(),
    rm: z.boolean().optional().default(true),
    detach: z.boolean().optional().default(false),
    user: z.string().optional(),
    env: z.array(z.string()).optional(),
    workdir: z.string().optional(),
    noDeps: z.boolean().optional().default(false),
  });

  it("requires service", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty service", () => {
    expect(() => schema.parse({ service: "" })).toThrow();
  });

  it("defaults rm to true, detach to false, noDeps to false", () => {
    const result = schema.parse({ service: "web" });
    expect(result.rm).toBe(true);
    expect(result.detach).toBe(false);
    expect(result.noDeps).toBe(false);
  });

  it("accepts full options", () => {
    const result = schema.parse({
      service: "web",
      command: ["sh", "-c", "echo hello"],
      user: "root",
      env: ["FOO=bar"],
      workdir: "/app",
      noDeps: true,
      detach: true,
    });
    expect(result.command).toEqual(["sh", "-c", "echo hello"]);
    expect(result.user).toBe("root");
    expect(result.env).toEqual(["FOO=bar"]);
    expect(result.noDeps).toBe(true);
  });
});

describe("docker_composeScale input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    scales: z.array(z.string()).min(1),
  });

  it("requires scales", () => {
    expect(() => schema.parse({})).toThrow();
  });

  it("rejects empty scales array", () => {
    expect(() => schema.parse({ scales: [] })).toThrow();
  });

  it("accepts single scale spec", () => {
    const result = schema.parse({ scales: ["web=3"] });
    expect(result.scales).toEqual(["web=3"]);
  });

  it("accepts multiple scale specs", () => {
    const result = schema.parse({ scales: ["web=3", "worker=2"] });
    expect(result.scales).toHaveLength(2);
  });

  it("accepts file option with scales", () => {
    const result = schema.parse({ file: "compose.yml", scales: ["api=5"] });
    expect(result.file).toBe("compose.yml");
  });
});

describe("docker_composeStart input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });

  it("accepts services list", () => {
    const result = schema.parse({ services: ["web", "db"] });
    expect(result.services).toEqual(["web", "db"]);
  });
});

describe("docker_composeStop input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
    timeout: z.number().optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });

  it("accepts timeout", () => {
    const result = schema.parse({ timeout: 30 });
    expect(result.timeout).toBe(30);
  });

  it("accepts services with timeout", () => {
    const result = schema.parse({ services: ["web"], timeout: 10 });
    expect(result.services).toEqual(["web"]);
    expect(result.timeout).toBe(10);
  });
});

describe("docker_composeTop input validation", () => {
  const schema = z.object({
    file: z.string().optional(),
    projectDir: z.string().optional(),
    services: z.array(z.string()).optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });

  it("accepts services list", () => {
    const result = schema.parse({ services: ["web", "worker"] });
    expect(result.services).toEqual(["web", "worker"]);
  });

  it("accepts file and projectDir", () => {
    const result = schema.parse({ file: "compose.yml", projectDir: "/project" });
    expect(result.file).toBe("compose.yml");
    expect(result.projectDir).toBe("/project");
  });
});

// ---- v0.9.0 Container Gaps ----

describe("docker_diff input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
  });

  it("accepts valid containerId", () => {
    const result = schema.parse({ containerId: "my-container" });
    expect(result.containerId).toBe("my-container");
  });

  it("rejects empty containerId", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });

  it("rejects missing containerId", () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe("docker_export input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    output: z.string().min(1),
  });

  it("accepts valid inputs", () => {
    const result = schema.parse({ containerId: "abc", output: "/tmp/export.tar" });
    expect(result.containerId).toBe("abc");
    expect(result.output).toBe("/tmp/export.tar");
  });

  it("rejects empty containerId", () => {
    expect(() => schema.parse({ containerId: "", output: "/tmp/out.tar" })).toThrow();
  });

  it("rejects empty output", () => {
    expect(() => schema.parse({ containerId: "abc", output: "" })).toThrow();
  });

  it("rejects missing output", () => {
    expect(() => schema.parse({ containerId: "abc" })).toThrow();
  });
});

describe("docker_port input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    privatePort: z.number().optional(),
    protocol: z.enum(["tcp", "udp"]).optional(),
  });

  it("accepts containerId only", () => {
    const result = schema.parse({ containerId: "web" });
    expect(result.containerId).toBe("web");
  });

  it("accepts with privatePort and protocol", () => {
    const result = schema.parse({ containerId: "web", privatePort: 80, protocol: "tcp" });
    expect(result.privatePort).toBe(80);
    expect(result.protocol).toBe("tcp");
  });

  it("rejects invalid protocol", () => {
    expect(() => schema.parse({ containerId: "web", protocol: "sctp" })).toThrow();
  });

  it("rejects empty containerId", () => {
    expect(() => schema.parse({ containerId: "" })).toThrow();
  });
});

describe("docker_rename input validation", () => {
  const schema = z.object({
    containerId: z.string().min(1),
    newName: z.string().min(1),
  });

  it("accepts valid inputs", () => {
    const result = schema.parse({ containerId: "old-name", newName: "new-name" });
    expect(result.containerId).toBe("old-name");
    expect(result.newName).toBe("new-name");
  });

  it("rejects empty newName", () => {
    expect(() => schema.parse({ containerId: "abc", newName: "" })).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => schema.parse({ containerId: "abc" })).toThrow();
  });
});

// ---- v0.9.0 Image Gaps ----

describe("docker_imageHistory input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
    noTrunc: z.boolean().optional().default(false),
    format: z.string().optional().default("json"),
  });

  it("accepts image only", () => {
    const result = schema.parse({ image: "nginx:latest" });
    expect(result.image).toBe("nginx:latest");
    expect(result.noTrunc).toBe(false);
    expect(result.format).toBe("json");
  });

  it("accepts all options", () => {
    const result = schema.parse({ image: "nginx", noTrunc: true, format: "table" });
    expect(result.noTrunc).toBe(true);
    expect(result.format).toBe("table");
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });
});

describe("docker_import input validation", () => {
  const schema = z.object({
    source: z.string().min(1),
    repository: z.string().optional(),
    tag: z.string().optional(),
    message: z.string().optional(),
    changes: z.array(z.string()).optional(),
  });

  it("accepts source only", () => {
    const result = schema.parse({ source: "/tmp/export.tar" });
    expect(result.source).toBe("/tmp/export.tar");
  });

  it("accepts all options", () => {
    const result = schema.parse({
      source: "https://example.com/rootfs.tar",
      repository: "myimage",
      tag: "v1",
      message: "Imported from backup",
      changes: ["CMD /bin/bash", "ENV FOO=bar"],
    });
    expect(result.repository).toBe("myimage");
    expect(result.tag).toBe("v1");
    expect(result.changes).toHaveLength(2);
  });

  it("rejects empty source", () => {
    expect(() => schema.parse({ source: "" })).toThrow();
  });
});

// ---- v0.9.0 Context Management ----

describe("docker_contextCreate input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    dockerEndpoint: z.string().min(1),
    defaultStack: z.string().optional(),
  });

  it("accepts required fields", () => {
    const result = schema.parse({ name: "prod", dockerEndpoint: "ssh://user@host" });
    expect(result.name).toBe("prod");
    expect(result.dockerEndpoint).toBe("ssh://user@host");
  });

  it("accepts all fields", () => {
    const result = schema.parse({
      name: "staging",
      description: "Staging server",
      dockerEndpoint: "tcp://host:2376",
      defaultStack: "swarm",
    });
    expect(result.description).toBe("Staging server");
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "", dockerEndpoint: "ssh://h" })).toThrow();
  });

  it("rejects empty dockerEndpoint", () => {
    expect(() => schema.parse({ name: "x", dockerEndpoint: "" })).toThrow();
  });
});

describe("docker_contextLs input validation", () => {
  const schema = z.object({
    format: z.string().optional().default("json"),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.format).toBe("json");
  });

  it("accepts custom format", () => {
    const result = schema.parse({ format: "table" });
    expect(result.format).toBe("table");
  });
});

describe("docker_contextInspect input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
  });

  it("accepts valid name", () => {
    const result = schema.parse({ name: "default" });
    expect(result.name).toBe("default");
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "" })).toThrow();
  });
});

describe("docker_contextRm input validation", () => {
  const schema = z.object({
    names: z.array(z.string()).min(1),
    force: z.boolean().optional().default(false),
  });

  it("accepts single name", () => {
    const result = schema.parse({ names: ["old-ctx"] });
    expect(result.names).toEqual(["old-ctx"]);
    expect(result.force).toBe(false);
  });

  it("accepts multiple names with force", () => {
    const result = schema.parse({ names: ["a", "b"], force: true });
    expect(result.names).toHaveLength(2);
    expect(result.force).toBe(true);
  });

  it("rejects empty names array", () => {
    expect(() => schema.parse({ names: [] })).toThrow();
  });
});

describe("docker_contextUse input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
  });

  it("accepts valid name", () => {
    const result = schema.parse({ name: "prod" });
    expect(result.name).toBe("prod");
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "" })).toThrow();
  });
});

describe("docker_contextShow input validation", () => {
  const schema = z.object({});

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });
});

// ---- v0.9.0 Registry Authentication ----

describe("docker_login input validation", () => {
  const schema = z.object({
    server: z.string().optional(),
    username: z.string().min(1),
    password: z.string().min(1),
  });

  it("accepts required fields", () => {
    const result = schema.parse({ username: "user", password: "token" });
    expect(result.username).toBe("user");
    expect(result.password).toBe("token");
  });

  it("accepts with server", () => {
    const result = schema.parse({ server: "ghcr.io", username: "user", password: "token" });
    expect(result.server).toBe("ghcr.io");
  });

  it("rejects empty username", () => {
    expect(() => schema.parse({ username: "", password: "token" })).toThrow();
  });

  it("rejects empty password", () => {
    expect(() => schema.parse({ username: "user", password: "" })).toThrow();
  });

  it("rejects missing username", () => {
    expect(() => schema.parse({ password: "token" })).toThrow();
  });
});

describe("docker_logout input validation", () => {
  const schema = z.object({
    server: z.string().optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.server).toBeUndefined();
  });

  it("accepts with server", () => {
    const result = schema.parse({ server: "ghcr.io" });
    expect(result.server).toBe("ghcr.io");
  });
});

// ---- v0.10.0 Swarm Cluster ----

describe("docker_swarmInit input validation", () => {
  const schema = z.object({
    advertiseAddr: z.string().optional(),
    listenAddr: z.string().optional(),
    forceNewCluster: z.boolean().optional().default(false),
    autolock: z.boolean().optional().default(false),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.forceNewCluster).toBe(false);
    expect(result.autolock).toBe(false);
  });

  it("accepts all options", () => {
    const result = schema.parse({ advertiseAddr: "eth0:2377", listenAddr: "0.0.0.0:2377", forceNewCluster: true, autolock: true });
    expect(result.advertiseAddr).toBe("eth0:2377");
    expect(result.autolock).toBe(true);
  });
});

describe("docker_swarmJoin input validation", () => {
  const schema = z.object({
    token: z.string().min(1),
    remoteAddrs: z.string().min(1),
    advertiseAddr: z.string().optional(),
    listenAddr: z.string().optional(),
  });

  it("accepts required fields", () => {
    const result = schema.parse({ token: "SWMTKN-abc", remoteAddrs: "192.168.1.1:2377" });
    expect(result.token).toBe("SWMTKN-abc");
    expect(result.remoteAddrs).toBe("192.168.1.1:2377");
  });

  it("rejects empty token", () => {
    expect(() => schema.parse({ token: "", remoteAddrs: "host:2377" })).toThrow();
  });

  it("rejects missing remoteAddrs", () => {
    expect(() => schema.parse({ token: "SWMTKN-abc" })).toThrow();
  });
});

describe("docker_swarmLeave input validation", () => {
  const schema = z.object({
    force: z.boolean().optional().default(false),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.force).toBe(false);
  });

  it("accepts force", () => {
    const result = schema.parse({ force: true });
    expect(result.force).toBe(true);
  });
});

describe("docker_swarmJoinToken input validation", () => {
  const schema = z.object({
    role: z.enum(["worker", "manager"]),
    rotate: z.boolean().optional().default(false),
  });

  it("accepts worker role", () => {
    const result = schema.parse({ role: "worker" });
    expect(result.role).toBe("worker");
  });

  it("accepts manager role with rotate", () => {
    const result = schema.parse({ role: "manager", rotate: true });
    expect(result.rotate).toBe(true);
  });

  it("rejects invalid role", () => {
    expect(() => schema.parse({ role: "leader" })).toThrow();
  });
});

describe("docker_swarmUpdate input validation", () => {
  const schema = z.object({
    taskHistoryLimit: z.number().optional(),
    snapshotInterval: z.number().optional(),
    autolock: z.boolean().optional(),
    certExpiry: z.string().optional(),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });

  it("accepts all options", () => {
    const result = schema.parse({ taskHistoryLimit: 5, snapshotInterval: 10000, autolock: true, certExpiry: "720h" });
    expect(result.taskHistoryLimit).toBe(5);
    expect(result.certExpiry).toBe("720h");
  });
});

describe("docker_swarmUnlock input validation", () => {
  const schema = z.object({
    key: z.string().min(1),
  });

  it("accepts valid key", () => {
    const result = schema.parse({ key: "SWMKEY-1-abc" });
    expect(result.key).toBe("SWMKEY-1-abc");
  });

  it("rejects empty key", () => {
    expect(() => schema.parse({ key: "" })).toThrow();
  });
});

describe("docker_swarmUnlockKey input validation", () => {
  const schema = z.object({
    rotate: z.boolean().optional().default(false),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.rotate).toBe(false);
  });

  it("accepts rotate", () => {
    const result = schema.parse({ rotate: true });
    expect(result.rotate).toBe(true);
  });
});

describe("docker_swarmCa input validation", () => {
  const schema = z.object({
    rotate: z.boolean().optional().default(false),
    certExpiry: z.string().optional(),
    detach: z.boolean().optional().default(false),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.rotate).toBe(false);
  });

  it("accepts all options", () => {
    const result = schema.parse({ rotate: true, certExpiry: "2160h", detach: true });
    expect(result.certExpiry).toBe("2160h");
  });
});

// ---- v0.10.0 Swarm Services ----

describe("docker_serviceCreate input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    image: z.string().min(1),
    replicas: z.number().optional(),
    mode: z.enum(["replicated", "global"]).optional(),
    ports: z.array(z.string()).optional(),
    env: z.array(z.string()).optional(),
    mounts: z.array(z.string()).optional(),
    networks: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    command: z.array(z.string()).optional(),
    restartPolicy: z.string().optional(),
    limitCpu: z.number().optional(),
    limitMemory: z.string().optional(),
  });

  it("accepts required fields", () => {
    const result = schema.parse({ name: "web", image: "nginx:latest" });
    expect(result.name).toBe("web");
    expect(result.image).toBe("nginx:latest");
  });

  it("accepts all options", () => {
    const result = schema.parse({
      name: "api", image: "node:20", replicas: 3, mode: "replicated",
      ports: ["8080:80"], env: ["NODE_ENV=production"], networks: ["backend"],
      constraints: ["node.role==worker"], labels: ["app=api"], command: ["node", "server.js"],
      limitCpu: 0.5, limitMemory: "256m",
    });
    expect(result.replicas).toBe(3);
    expect(result.ports).toEqual(["8080:80"]);
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "", image: "nginx" })).toThrow();
  });

  it("rejects invalid mode", () => {
    expect(() => schema.parse({ name: "web", image: "nginx", mode: "daemonset" })).toThrow();
  });
});

describe("docker_serviceUpdate input validation", () => {
  const schema = z.object({
    service: z.string().min(1),
    image: z.string().optional(),
    replicas: z.number().optional(),
    env: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    force: z.boolean().optional().default(false),
    limitCpu: z.number().optional(),
    limitMemory: z.string().optional(),
    args: z.array(z.string()).optional(),
  });

  it("accepts service only", () => {
    const result = schema.parse({ service: "web" });
    expect(result.service).toBe("web");
  });

  it("accepts all options", () => {
    const result = schema.parse({ service: "web", image: "nginx:2", replicas: 5, force: true });
    expect(result.image).toBe("nginx:2");
    expect(result.force).toBe(true);
  });

  it("rejects empty service", () => {
    expect(() => schema.parse({ service: "" })).toThrow();
  });
});

describe("docker_serviceRm input validation", () => {
  const schema = z.object({
    services: z.array(z.string()).min(1),
  });

  it("accepts single service", () => {
    const result = schema.parse({ services: ["web"] });
    expect(result.services).toEqual(["web"]);
  });

  it("accepts multiple services", () => {
    const result = schema.parse({ services: ["web", "api"] });
    expect(result.services).toHaveLength(2);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ services: [] })).toThrow();
  });
});

describe("docker_serviceLs input validation", () => {
  const schema = z.object({
    filter: z.array(z.string()).optional(),
    format: z.string().optional().default("json"),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.format).toBe("json");
  });

  it("accepts filters", () => {
    const result = schema.parse({ filter: ["name=web"] });
    expect(result.filter).toEqual(["name=web"]);
  });
});

describe("docker_serviceInspect input validation", () => {
  const schema = z.object({
    service: z.string().min(1),
    pretty: z.boolean().optional().default(false),
  });

  it("accepts service", () => {
    const result = schema.parse({ service: "web" });
    expect(result.service).toBe("web");
  });

  it("rejects empty service", () => {
    expect(() => schema.parse({ service: "" })).toThrow();
  });
});

describe("docker_serviceLogs input validation", () => {
  const schema = z.object({
    service: z.string().min(1),
    tail: z.number().optional(),
    since: z.string().optional(),
    timestamps: z.boolean().optional().default(false),
  });

  it("accepts service only", () => {
    const result = schema.parse({ service: "web" });
    expect(result.service).toBe("web");
  });

  it("accepts all options", () => {
    const result = schema.parse({ service: "web", tail: 100, since: "10m", timestamps: true });
    expect(result.tail).toBe(100);
  });
});

describe("docker_servicePs input validation", () => {
  const schema = z.object({
    service: z.string().min(1),
    filter: z.array(z.string()).optional(),
    format: z.string().optional().default("json"),
  });

  it("accepts service", () => {
    const result = schema.parse({ service: "web" });
    expect(result.format).toBe("json");
  });

  it("accepts filters", () => {
    const result = schema.parse({ service: "web", filter: ["desired-state=running"] });
    expect(result.filter).toEqual(["desired-state=running"]);
  });
});

describe("docker_serviceScale input validation", () => {
  const schema = z.object({
    scales: z.array(z.string()).min(1),
  });

  it("accepts scale specs", () => {
    const result = schema.parse({ scales: ["web=5", "api=3"] });
    expect(result.scales).toHaveLength(2);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ scales: [] })).toThrow();
  });
});

describe("docker_serviceRollback input validation", () => {
  const schema = z.object({
    service: z.string().min(1),
    detach: z.boolean().optional().default(false),
  });

  it("accepts service", () => {
    const result = schema.parse({ service: "web" });
    expect(result.detach).toBe(false);
  });

  it("accepts with detach", () => {
    const result = schema.parse({ service: "web", detach: true });
    expect(result.detach).toBe(true);
  });

  it("rejects empty service", () => {
    expect(() => schema.parse({ service: "" })).toThrow();
  });
});

// ---- v0.10.0 Swarm Nodes ----

describe("docker_nodeLs input validation", () => {
  const schema = z.object({
    filter: z.array(z.string()).optional(),
    format: z.string().optional().default("json"),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.format).toBe("json");
  });

  it("accepts filters", () => {
    const result = schema.parse({ filter: ["role=manager"] });
    expect(result.filter).toEqual(["role=manager"]);
  });
});

describe("docker_nodeInspect input validation", () => {
  const schema = z.object({
    node: z.string().min(1),
    pretty: z.boolean().optional().default(false),
  });

  it("accepts node", () => {
    const result = schema.parse({ node: "node1" });
    expect(result.node).toBe("node1");
  });

  it("rejects empty node", () => {
    expect(() => schema.parse({ node: "" })).toThrow();
  });
});

describe("docker_nodePs input validation", () => {
  const schema = z.object({
    node: z.string().optional(),
    filter: z.array(z.string()).optional(),
    format: z.string().optional().default("json"),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.format).toBe("json");
  });

  it("accepts with node", () => {
    const result = schema.parse({ node: "node1" });
    expect(result.node).toBe("node1");
  });
});

describe("docker_nodeRm input validation", () => {
  const schema = z.object({
    nodes: z.array(z.string()).min(1),
    force: z.boolean().optional().default(false),
  });

  it("accepts nodes", () => {
    const result = schema.parse({ nodes: ["node1"] });
    expect(result.nodes).toEqual(["node1"]);
  });

  it("accepts with force", () => {
    const result = schema.parse({ nodes: ["node1", "node2"], force: true });
    expect(result.force).toBe(true);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ nodes: [] })).toThrow();
  });
});

describe("docker_nodeUpdate input validation", () => {
  const schema = z.object({
    node: z.string().min(1),
    availability: z.enum(["active", "pause", "drain"]).optional(),
    role: z.enum(["worker", "manager"]).optional(),
    labels: z.array(z.string()).optional(),
  });

  it("accepts node only", () => {
    const result = schema.parse({ node: "node1" });
    expect(result.node).toBe("node1");
  });

  it("accepts all options", () => {
    const result = schema.parse({ node: "node1", availability: "drain", role: "manager", labels: ["env=prod"] });
    expect(result.availability).toBe("drain");
    expect(result.role).toBe("manager");
  });

  it("rejects invalid availability", () => {
    expect(() => schema.parse({ node: "node1", availability: "standby" })).toThrow();
  });

  it("rejects invalid role", () => {
    expect(() => schema.parse({ node: "node1", role: "leader" })).toThrow();
  });
});

describe("docker_nodePromote input validation", () => {
  const schema = z.object({
    nodes: z.array(z.string()).min(1),
  });

  it("accepts nodes", () => {
    const result = schema.parse({ nodes: ["worker1", "worker2"] });
    expect(result.nodes).toHaveLength(2);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ nodes: [] })).toThrow();
  });
});

describe("docker_nodeDemote input validation", () => {
  const schema = z.object({
    nodes: z.array(z.string()).min(1),
  });

  it("accepts nodes", () => {
    const result = schema.parse({ nodes: ["manager2"] });
    expect(result.nodes).toEqual(["manager2"]);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ nodes: [] })).toThrow();
  });
});

// ---- v0.11.0 Swarm Stacks ----

describe("docker_stackDeploy input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    composeFile: z.string().min(1),
    prune: z.boolean().optional().default(false),
    resolveImage: z.enum(["always", "changed", "never"]).optional(),
    withRegistryAuth: z.boolean().optional().default(false),
  });

  it("accepts required fields", () => {
    const result = schema.parse({ name: "mystack", composeFile: "docker-compose.yml" });
    expect(result.name).toBe("mystack");
    expect(result.composeFile).toBe("docker-compose.yml");
  });

  it("accepts all options", () => {
    const result = schema.parse({ name: "mystack", composeFile: "compose.yml", prune: true, resolveImage: "always", withRegistryAuth: true });
    expect(result.prune).toBe(true);
    expect(result.resolveImage).toBe("always");
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "", composeFile: "compose.yml" })).toThrow();
  });

  it("rejects invalid resolveImage", () => {
    expect(() => schema.parse({ name: "s", composeFile: "f", resolveImage: "sometimes" })).toThrow();
  });
});

describe("docker_stackRm input validation", () => {
  const schema = z.object({
    stacks: z.array(z.string()).min(1),
  });

  it("accepts stacks", () => {
    const result = schema.parse({ stacks: ["web", "api"] });
    expect(result.stacks).toHaveLength(2);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ stacks: [] })).toThrow();
  });
});

describe("docker_stackLs input validation", () => {
  const schema = z.object({
    format: z.string().optional().default("json"),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.format).toBe("json");
  });
});

describe("docker_stackPs input validation", () => {
  const schema = z.object({
    stack: z.string().min(1),
    filter: z.array(z.string()).optional(),
    format: z.string().optional().default("json"),
  });

  it("accepts stack", () => {
    const result = schema.parse({ stack: "web" });
    expect(result.format).toBe("json");
  });

  it("rejects empty stack", () => {
    expect(() => schema.parse({ stack: "" })).toThrow();
  });
});

describe("docker_stackServices input validation", () => {
  const schema = z.object({
    stack: z.string().min(1),
    filter: z.array(z.string()).optional(),
    format: z.string().optional().default("json"),
  });

  it("accepts stack with filters", () => {
    const result = schema.parse({ stack: "web", filter: ["name=api"] });
    expect(result.filter).toEqual(["name=api"]);
  });

  it("rejects empty stack", () => {
    expect(() => schema.parse({ stack: "" })).toThrow();
  });
});

describe("docker_stackConfig input validation", () => {
  const schema = z.object({
    composeFile: z.string().min(1),
  });

  it("accepts compose file", () => {
    const result = schema.parse({ composeFile: "docker-compose.yml" });
    expect(result.composeFile).toBe("docker-compose.yml");
  });

  it("rejects empty", () => {
    expect(() => schema.parse({ composeFile: "" })).toThrow();
  });
});

// ---- v0.11.0 Swarm Configs ----

describe("docker_configCreate input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    file: z.string().optional(),
    data: z.string().optional(),
    labels: z.array(z.string()).optional(),
  });

  it("accepts with file", () => {
    const result = schema.parse({ name: "my-config", file: "/path/to/config" });
    expect(result.name).toBe("my-config");
  });

  it("accepts with inline data", () => {
    const result = schema.parse({ name: "my-config", data: "key=value" });
    expect(result.data).toBe("key=value");
  });

  it("accepts with labels", () => {
    const result = schema.parse({ name: "cfg", file: "f", labels: ["env=prod"] });
    expect(result.labels).toEqual(["env=prod"]);
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "", file: "f" })).toThrow();
  });
});

describe("docker_configInspect input validation", () => {
  const schema = z.object({
    config: z.string().min(1),
    pretty: z.boolean().optional().default(false),
  });

  it("accepts config", () => {
    const result = schema.parse({ config: "my-config" });
    expect(result.pretty).toBe(false);
  });

  it("rejects empty config", () => {
    expect(() => schema.parse({ config: "" })).toThrow();
  });
});

describe("docker_configLs input validation", () => {
  const schema = z.object({
    filter: z.array(z.string()).optional(),
    format: z.string().optional().default("json"),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.format).toBe("json");
  });

  it("accepts filters", () => {
    const result = schema.parse({ filter: ["name=my-config"] });
    expect(result.filter).toEqual(["name=my-config"]);
  });
});

describe("docker_configRm input validation", () => {
  const schema = z.object({
    configs: z.array(z.string()).min(1),
  });

  it("accepts configs", () => {
    const result = schema.parse({ configs: ["cfg1", "cfg2"] });
    expect(result.configs).toHaveLength(2);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ configs: [] })).toThrow();
  });
});

// ---- v0.11.0 Swarm Secrets ----

describe("docker_secretCreate input validation", () => {
  const schema = z.object({
    name: z.string().min(1),
    file: z.string().optional(),
    data: z.string().optional(),
    labels: z.array(z.string()).optional(),
  });

  it("accepts with file", () => {
    const result = schema.parse({ name: "my-secret", file: "/path/to/secret" });
    expect(result.name).toBe("my-secret");
  });

  it("accepts with inline data", () => {
    const result = schema.parse({ name: "my-secret", data: "s3cret" });
    expect(result.data).toBe("s3cret");
  });

  it("accepts with labels", () => {
    const result = schema.parse({ name: "sec", file: "f", labels: ["env=prod"] });
    expect(result.labels).toEqual(["env=prod"]);
  });

  it("rejects empty name", () => {
    expect(() => schema.parse({ name: "", data: "x" })).toThrow();
  });
});

describe("docker_secretInspect input validation", () => {
  const schema = z.object({
    secret: z.string().min(1),
    pretty: z.boolean().optional().default(false),
  });

  it("accepts secret", () => {
    const result = schema.parse({ secret: "my-secret" });
    expect(result.pretty).toBe(false);
  });

  it("rejects empty secret", () => {
    expect(() => schema.parse({ secret: "" })).toThrow();
  });
});

describe("docker_secretLs input validation", () => {
  const schema = z.object({
    filter: z.array(z.string()).optional(),
    format: z.string().optional().default("json"),
  });

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result.format).toBe("json");
  });

  it("accepts filters", () => {
    const result = schema.parse({ filter: ["name=my-secret"] });
    expect(result.filter).toEqual(["name=my-secret"]);
  });
});

describe("docker_secretRm input validation", () => {
  const schema = z.object({
    secrets: z.array(z.string()).min(1),
  });

  it("accepts secrets", () => {
    const result = schema.parse({ secrets: ["sec1"] });
    expect(result.secrets).toEqual(["sec1"]);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ secrets: [] })).toThrow();
  });
});

// ---- v0.11.0 Docker Content Trust ----

describe("docker_trustInspect input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
    pretty: z.boolean().optional().default(false),
  });

  it("accepts image", () => {
    const result = schema.parse({ image: "docker.io/library/nginx" });
    expect(result.image).toBe("docker.io/library/nginx");
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });
});

describe("docker_trustSign input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
    local: z.boolean().optional().default(false),
  });

  it("accepts image", () => {
    const result = schema.parse({ image: "registry.example.com/app:v1" });
    expect(result.local).toBe(false);
  });

  it("accepts with local", () => {
    const result = schema.parse({ image: "app:v1", local: true });
    expect(result.local).toBe(true);
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });
});

describe("docker_trustRevoke input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
    yes: z.boolean().optional().default(true),
  });

  it("accepts image", () => {
    const result = schema.parse({ image: "app:v1" });
    expect(result.yes).toBe(true);
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });
});

describe("docker_trustKey input validation", () => {
  const schema = z.object({
    action: z.enum(["generate", "load"]),
    name: z.string().optional(),
    keyFile: z.string().optional(),
  });

  it("accepts generate with name", () => {
    const result = schema.parse({ action: "generate", name: "mykey" });
    expect(result.action).toBe("generate");
    expect(result.name).toBe("mykey");
  });

  it("accepts load with keyFile", () => {
    const result = schema.parse({ action: "load", keyFile: "/path/to/key.pem" });
    expect(result.action).toBe("load");
    expect(result.keyFile).toBe("/path/to/key.pem");
  });

  it("rejects invalid action", () => {
    expect(() => schema.parse({ action: "delete" })).toThrow();
  });
});

// ---- v0.12.0 Utility ----

describe("docker_version input validation", () => {
  const schema = z.object({});

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });
});

describe("docker_composeVersion input validation", () => {
  const schema = z.object({});

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });
});

// ---- v0.12.0 Compose extras ----

describe("docker_composeWatch input validation", () => {
  const schema = z.object({
    projectDirectory: z.string().min(1),
    services: z.array(z.string()).optional(),
    noUp: z.boolean().optional().default(false),
    quiet: z.boolean().optional().default(false),
  });

  it("accepts required fields", () => {
    const result = schema.parse({ projectDirectory: "/app" });
    expect(result.projectDirectory).toBe("/app");
    expect(result.noUp).toBe(false);
  });

  it("accepts with services", () => {
    const result = schema.parse({ projectDirectory: "/app", services: ["web", "api"] });
    expect(result.services).toEqual(["web", "api"]);
  });

  it("accepts with options", () => {
    const result = schema.parse({ projectDirectory: "/app", noUp: true, quiet: true });
    expect(result.noUp).toBe(true);
    expect(result.quiet).toBe(true);
  });

  it("rejects empty projectDirectory", () => {
    expect(() => schema.parse({ projectDirectory: "" })).toThrow();
  });
});

// ---- v0.12.0 Docker Scout ----

describe("docker_scoutQuickview input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
  });

  it("accepts image", () => {
    const result = schema.parse({ image: "nginx:latest" });
    expect(result.image).toBe("nginx:latest");
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });
});

describe("docker_scoutCves input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
    onlyFixed: z.boolean().optional().default(false),
    severities: z.string().optional(),
  });

  it("accepts image only", () => {
    const result = schema.parse({ image: "nginx:latest" });
    expect(result.onlyFixed).toBe(false);
  });

  it("accepts with filters", () => {
    const result = schema.parse({ image: "nginx", onlyFixed: true, severities: "critical,high" });
    expect(result.onlyFixed).toBe(true);
    expect(result.severities).toBe("critical,high");
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });
});

describe("docker_scoutRecommendations input validation", () => {
  const schema = z.object({
    image: z.string().min(1),
  });

  it("accepts image", () => {
    const result = schema.parse({ image: "node:18" });
    expect(result.image).toBe("node:18");
  });

  it("rejects empty image", () => {
    expect(() => schema.parse({ image: "" })).toThrow();
  });
});

// ---- v0.12.0 Plugin management ----

describe("docker_pluginLs input validation", () => {
  const schema = z.object({});

  it("accepts empty input", () => {
    const result = schema.parse({});
    expect(result).toEqual({});
  });
});

describe("docker_pluginInstall input validation", () => {
  const schema = z.object({
    plugin: z.string().min(1),
    grantAllPermissions: z.boolean().optional().default(true),
    alias: z.string().optional(),
  });

  it("accepts plugin name", () => {
    const result = schema.parse({ plugin: "vieux/sshfs" });
    expect(result.plugin).toBe("vieux/sshfs");
    expect(result.grantAllPermissions).toBe(true);
  });

  it("accepts with alias", () => {
    const result = schema.parse({ plugin: "vieux/sshfs", alias: "sshfs" });
    expect(result.alias).toBe("sshfs");
  });

  it("rejects empty plugin", () => {
    expect(() => schema.parse({ plugin: "" })).toThrow();
  });
});

describe("docker_pluginRm input validation", () => {
  const schema = z.object({
    plugins: z.array(z.string()).min(1),
    force: z.boolean().optional().default(false),
  });

  it("accepts plugins", () => {
    const result = schema.parse({ plugins: ["vieux/sshfs"] });
    expect(result.plugins).toEqual(["vieux/sshfs"]);
  });

  it("accepts with force", () => {
    const result = schema.parse({ plugins: ["p1"], force: true });
    expect(result.force).toBe(true);
  });

  it("rejects empty array", () => {
    expect(() => schema.parse({ plugins: [] })).toThrow();
  });
});

describe("docker_pluginEnable input validation", () => {
  const schema = z.object({
    plugin: z.string().min(1),
  });

  it("accepts plugin name", () => {
    const result = schema.parse({ plugin: "vieux/sshfs" });
    expect(result.plugin).toBe("vieux/sshfs");
  });

  it("rejects empty plugin", () => {
    expect(() => schema.parse({ plugin: "" })).toThrow();
  });
});
