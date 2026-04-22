#!/usr/bin/env node

// 作用：为长驻任务提供统一的“就绪等待”能力。
// 场景：端口、HTTP、日志关键字、PID 存活检测。

import fs from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import process from "node:process";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

// 统一帮助输出，便于作为独立辅助脚本复用。
function usage() {
  console.log(`用法:
  wait-ready.mjs --mode port --port 3000 [--host 127.0.0.1]
  wait-ready.mjs --mode http --url http://127.0.0.1:3000/health
  wait-ready.mjs --mode log --log-file /tmp/task.log --match "ready"
  wait-ready.mjs --mode pid --pid 12345

参数:
  --timeout-ms   总等待超时，默认 120000
  --interval-ms  轮询间隔，默认 1000
  --expect-status 使用 http 模式时期望的状态码`);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// 通过 TCP 连接判断端口是否可接受连接。
async function checkPort(host, port) {
  await new Promise((resolve, reject) => {
    const socket = net.connect({ host, port: Number(port) });

    socket.once("connect", () => {
      socket.end();
      resolve();
    });

    socket.once("error", reject);
    socket.setTimeout(1000, () => {
      socket.destroy(new Error("timeout"));
    });
  });
}

// 通过 HTTP 响应判断服务是否完成启动。
async function checkHttp(urlValue, expectStatus) {
  const client = urlValue.startsWith("https:") ? https : http;

  const status = await new Promise((resolve, reject) => {
    const request = client.request(urlValue, { method: "GET" }, (response) => {
      const { statusCode = 0 } = response;
      response.resume();
      resolve(statusCode);
    });

    request.once("error", reject);
    request.setTimeout(2000, () => {
      request.destroy(new Error("timeout"));
    });
    request.end();
  });

  if (expectStatus !== undefined && Number(expectStatus) !== Number(status)) {
    throw new Error(`期望 HTTP ${expectStatus}，实际得到 ${status}`);
  }

  if (status <= 0) {
    throw new Error("没有拿到 HTTP 状态码");
  }
}

// 通过日志关键字判断某个后台任务是否完成初始化。
async function checkLog(logFile, match) {
  const contents = await fs.readFile(logFile, "utf8");

  if (!contents.includes(match)) {
    throw new Error(`日志中未找到关键字: ${match}`);
  }
}

// 通过 0 信号判断目标 PID 是否仍然存在。
async function checkPid(pidValue) {
  process.kill(Number(pidValue), 0);
}

async function waitUntilReady(args) {
  const mode = args.mode;
  const host = args.host ?? "127.0.0.1";
  const timeoutMs = Number(args["timeout-ms"] ?? 120000);
  const intervalMs = Number(args["interval-ms"] ?? 1000);
  const deadline = Date.now() + timeoutMs;
  let lastError = "unknown failure";

  while (Date.now() < deadline) {
    try {
      if (mode === "port") {
        if (!args.port) {
          throw new Error("port 模式必须提供 --port");
        }
        await checkPort(host, args.port);
      } else if (mode === "http") {
        if (!args.url) {
          throw new Error("http 模式必须提供 --url");
        }
        await checkHttp(args.url, args["expect-status"]);
      } else if (mode === "log") {
        if (!args["log-file"] || !args.match) {
          throw new Error("log 模式必须同时提供 --log-file 和 --match");
        }
        await checkLog(args["log-file"], args.match);
      } else if (mode === "pid") {
        if (!args.pid) {
          throw new Error("pid 模式必须提供 --pid");
        }
        await checkPid(args.pid);
      } else {
        throw new Error(`不支持的模式: ${String(mode)}`);
      }

      console.log(`[wait-ready] 已就绪，模式: ${mode}`);
      return;
    } catch (error) {
      // 记录最近一次失败原因，超时时便于排查。
      lastError = error instanceof Error ? error.message : String(error);
      await sleep(intervalMs);
    }
  }

  throw new Error(`等待超时，${timeoutMs}ms 后仍未就绪: ${lastError}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.mode) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  await waitUntilReady(args);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[wait-ready] ${message}`);
  process.exit(1);
});
