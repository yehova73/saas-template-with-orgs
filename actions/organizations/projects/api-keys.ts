"use server";

import { prisma } from "@/lib/prisma";
import { requireProjectAdmin } from "./project";
import { ServerActionResponse } from "@/hooks/use-server-action";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function generateApiKey(): string {
  const bytes = crypto.randomBytes(32);
  return `sk_${bytes.toString("hex")}`;
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function getProjectApiKeys(projectId: string) {
  await requireProjectAdmin(projectId);

  return prisma.apiKey.findMany({
    where: { projectId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createApiKeyAction({
  projectId,
  name,
  expiresAt,
}: {
  projectId: string;
  name: string;
  expiresAt?: string | null;
}): Promise<
  ServerActionResponse<{
    id: string;
    key: string;
    name: string;
    keyPrefix: string;
    expiresAt: Date | null;
    createdAt: Date;
  }>
> {
  try {
    await requireProjectAdmin(projectId);

    if (!name.trim()) {
      return {
        status: "error",
        message: { title: "API key name is required" },
      };
    }

    const rawKey = generateApiKey();
    const keyHash = hashKey(rawKey);
    const keyPrefix = rawKey.slice(0, 16);

    const apiKey = await prisma.apiKey.create({
      data: {
        projectId,
        name: name.trim(),
        keyHash,
        keyPrefix,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    revalidatePath(`/app/${projectId}/api-keys`);

    return {
      status: "ok",
      data: {
        id: apiKey.id,
        key: rawKey,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
    };
  } catch (err) {
    console.error(err);
    return { status: "error", message: { title: "Failed to create API key" } };
  }
}

export async function deleteApiKeyAction({
  projectId,
  apiKeyId,
}: {
  projectId: string;
  apiKeyId: string;
}): Promise<ServerActionResponse<null>> {
  try {
    await requireProjectAdmin(projectId);

    await prisma.apiKey.delete({
      where: { id: apiKeyId, projectId },
    });

    revalidatePath(`/app/${projectId}/api-keys`);

    return { status: "ok", data: null };
  } catch (err) {
    console.error(err);
    return { status: "error", message: { title: "Failed to delete API key" } };
  }
}
