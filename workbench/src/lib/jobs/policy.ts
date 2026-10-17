export const COST_CAP_USD = 10;

export function needsSecondConfirm(estimate: number, cap = COST_CAP_USD) {
  return Number.isFinite(estimate) && estimate > cap;
}

export const JOB_STATUS_LABEL: Record<string, string> = {
  queued: "排队",
  awaiting_approval: "待批准",
  running: "进行中",
  succeeded: "已完成",
  failed: "失败",
  cancelled: "已取消",
};
