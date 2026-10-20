import { check, now } from "./files.mjs";

export function assetDetails(asset, takes) {
  const selected = takes.some((t) => t.take_id === asset.selected_take_id && t.asset_name === asset.asset_name);
  const fallback = takes.some((t) => t.asset_name === asset.asset_name) || asset.prompt?.trim() ? "draft" : "pending";
  return {
    ...asset,
    metadata_revision: asset.metadata_revision || 0,
    review_status: selected ? "accepted" : ["pending", "draft"].includes(asset.review_status) ? asset.review_status : fallback,
  };
}

// Only explicit review actions select a default. Source prompts stay on each take.
export function updateAsset(store, name, input) {
  return store.transaction(() => {
    const asset = store.get("asset", name);
    check(asset, "资产不存在", 404);
    check(input && typeof input === "object", "需要素材详情");
    if (input.expected_revision !== undefined)
      check(input.expected_revision === (asset.metadata_revision || 0), "素材详情已在别处修改，请先载入最新内容再保存。当前输入仍保留。", 409);
    check(["tag", "prompt", "review_status"].some((key) => Object.hasOwn(input, key)), "没有可保存的素材详情");
    const next = { ...asset, metadata_revision: (asset.metadata_revision || 0) + 1, updated_at: now() };
    for (const field of ["tag", "prompt"]) {
      if (!Object.hasOwn(input, field)) continue;
      check(typeof input[field] === "string", `${field} 需要文本`);
      next[field] = input[field];
    }
    if (Object.hasOwn(input, "tag")) next.tag_source = "manual";
    if (Object.hasOwn(input, "review_status")) {
      check(["pending", "draft", "accepted"].includes(input.review_status), "素材状态应为待定、草稿或已接受");
      next.review_status = input.review_status;
      if (input.review_status === "accepted") {
        const take = store.get("take", input.selected_take_id || asset.selected_take_id || "");
        check(take?.asset_name === name && take.technical_status === "checked", "请先选择这个资产中已导入并通过技术检查的素材");
        next.selected_take_id = take.take_id;
        next.locked = true;
        next.accepted_at = now();
        store.put("take", take.take_id, {
          ...take,
          visual_status: input.visual_status === "unreviewed" ? "unreviewed" : "passed",
          adopted_at: next.accepted_at,
        });
      } else {
        next.selected_take_id = null;
        next.locked = false;
        next.accepted_at = null;
      }
    }
    store.put("asset", name, next);
    return assetDetails(next, store.list("take"));
  });
}
