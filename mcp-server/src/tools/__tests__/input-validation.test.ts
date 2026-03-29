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
