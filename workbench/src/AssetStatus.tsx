import { cn } from "./components/ui";

export const assetStates = {
  pending: { label: "待定", dot: "bg-slate-400", badge: "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300" },
  draft: { label: "草稿", dot: "bg-amber-400", badge: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  accepted: { label: "已接受", dot: "bg-emerald-500", badge: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
};
export type AssetState = keyof typeof assetStates;
export function assetState(asset: any, hasMedia = false): AssetState {
  if (asset.selected_take_id) return "accepted";
  if (asset.review_status === "pending" || asset.review_status === "draft") return asset.review_status;
  return hasMedia || asset.prompt?.trim() ? "draft" : "pending";
}
export function AssetStatus({ status }: { status: AssetState }) {
  const state = assetStates[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", state.badge)}>
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", state.dot)} />
      {state.label}
    </span>
  );
}
