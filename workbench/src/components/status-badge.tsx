import { Badge } from "@/components/ui/badge";
import type { StageStatus } from "@/lib/types";

const VARIANTS: Record<StageStatus, "outline" | "secondary" | "default" | "destructive"> = {
  未开始: "outline",
  进行中: "secondary",
  已完成: "default",
  已通过: "default",
  阻断: "destructive",
};

export function StatusBadge({ status }: { status: StageStatus }) {
  return <Badge variant={VARIANTS[status]}>{status}</Badge>;
}
