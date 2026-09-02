"use server";

export async function exportAccountDataAction(): Promise<{
  exportedAt: string;
}> {
  return {
    exportedAt: new Date().toISOString(),
  };
}
