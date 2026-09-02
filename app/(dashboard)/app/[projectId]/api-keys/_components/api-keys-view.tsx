"use client";

import { deleteApiKeyAction } from "@/actions/organizations/projects/api-keys";
import { useCreateApiKeyModal } from "@/components/modals/create-api-key-modal/use-create-api-key-modal";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import useServerAction from "@/hooks/use-server-action";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  expiresAt: Date | null;
  createdAt: Date;
};

type ApiKeysViewProps = {
  projectId: string;
  initialKeys: ApiKey[];
};

export function ApiKeysView({ projectId, initialKeys }: ApiKeysViewProps) {
  const { openDialog } = useCreateApiKeyModal();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { call: deleteKey } = useServerAction(deleteApiKeyAction);

  async function handleDelete(apiKeyId: string) {
    if (
      !confirm(
        "Are you sure you want to delete this API key? This cannot be undone.",
      )
    )
      return;
    setDeletingId(apiKeyId);
    await deleteKey({ projectId, apiKeyId });
    setDeletingId(null);
  }

  if (initialKeys.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Empty className="max-w-sm border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <KeyRound />
            </EmptyMedia>
            <EmptyTitle>No API keys yet</EmptyTitle>
            <EmptyDescription>
              Create an API key to authenticate requests to your project.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => openDialog(projectId)}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => openDialog(projectId)}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialKeys.map((key) => {
            const isExpired =
              key.expiresAt && new Date(key.expiresAt) < new Date();
            return (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell>
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {key.keyPrefix}••••••••••••••••••••
                  </code>
                </TableCell>
                <TableCell>
                  {key.expiresAt ? (
                    <Badge variant={isExpired ? "destructive" : "outline"}>
                      {isExpired
                        ? "Expired"
                        : new Date(key.expiresAt).toLocaleDateString()}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Never</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(key.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    disabled={deletingId === key.id}
                    onClick={() => handleDelete(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
