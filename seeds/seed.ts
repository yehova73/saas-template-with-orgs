import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import dotenv from "dotenv";
import { exit } from "process";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
  });

export async function seed() {
  exit(0);
}

seed();
