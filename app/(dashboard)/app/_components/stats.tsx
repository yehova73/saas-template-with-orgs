import { StatUI } from "@/components/ui/stats";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AlertCircle, CheckCircle2, ClipboardList, Clock } from "lucide-react";

export const OverviewStats: React.FC<{ userId: string }> = async ({
  userId,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* <StatUI
        title="Active Requests"
        stat={metrics?.total_assignations.toString() ?? "0"}
        icon={<ClipboardList />}
      />

      <StatUI
        title="Completion Rate"
        stat={
          metrics && metrics.sum_total_fields > 0
            ? (
                (Number(metrics.sum_completed_fields) * 100) /
                Number(metrics.sum_total_fields)
              ).toFixed(2) + "%"
            : "0%"
        }
        icon={<CheckCircle2 />}
      />

      <StatUI
        title="Pending Documents"
        stat={
          metrics
            ? (metrics.missing_required_fields_count.toString() ?? "0")
            : "0"
        }
        icon={<AlertCircle />}
      />

      <StatUI
        title="Overdue"
        stat={
          metrics ? (metrics.overdue_assignations_count.toString() ?? "0") : "0"
        }
        icon={<Clock />}
      /> */}
    </div>
  );
};
