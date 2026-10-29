// GEÇİCİ teşhis ucu: Hostinger işlem sınırını incelemek için; sonra silinecek.
import fs from "node:fs";
import os from "node:os";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function readStatus(pid: string) {
  try {
    const status = fs.readFileSync(`/proc/${pid}/status`, "utf8");
    const field = (name: string) =>
      status.match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1];
    const cmd = fs
      .readFileSync(`/proc/${pid}/cmdline`, "utf8")
      .replace(/\0/g, " ")
      .slice(0, 160);
    return {
      pid,
      name: field("Name"),
      ppid: field("PPid"),
      threads: Number(field("Threads")),
      rss: field("VmRSS"),
      cmd,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let procs: ReturnType<typeof readStatus>[] = [];
  try {
    procs = fs
      .readdirSync("/proc")
      .filter((entry) => /^\d+$/.test(entry))
      .map(readStatus)
      .filter(Boolean);
  } catch {
    // /proc okunamıyorsa yalnız süreç bilgisi döner.
  }
  return NextResponse.json({
    cpus: os.cpus().length,
    pid: process.pid,
    ppid: process.ppid,
    cwd: process.cwd(),
    argv: process.argv,
    execArgv: process.execArgv,
    nodeOptions: process.env.NODE_OPTIONS ?? null,
    uvThreadpool: process.env.UV_THREADPOOL_SIZE ?? null,
    npmLifecycle: process.env.npm_lifecycle_script ?? null,
    totalThreads: procs.reduce((sum, proc) => sum + (proc?.threads ?? 0), 0),
    procs,
  });
}
