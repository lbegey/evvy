import { PrismaClient } from "@prisma/client";
import path from "path";

// Windows path.resolve uses backslashes — SQLite URLs need forward slashes.
const dbPath = path.resolve(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/");
const dbUrl = `file:${dbPath}`;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ datasources: { db: { url: dbUrl } } });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
