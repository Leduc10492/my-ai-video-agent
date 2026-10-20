#!/usr/bin/env python3
"""拆解 + 舞台 + 镜头 → 每镜提示词、分段建议、问题清单、审片页（含每镜分镜草图）。

用法：
  python3 compile.py 场景目录          读 01_拆解.yaml、02_舞台.yaml、03_镜头.yaml，写到 场景目录/输出/
  python3 compile.py 舞台.yaml 镜头.yaml 输出目录 [拆解.yaml]
世界只在舞台里写一次；镜头只给机位和时间段。画面左右、谁看得见、谁闭嘴、
场景参考图用哪张、玻璃现在什么状态、画面长什么样，全部由这里按几何关系算出来，不靠人写。
"""
import copy
import html
import json
import math
import sys
from pathlib import Path

import yaml

FOV = {"远景": 80, "全景": 70, "中景": 50, "中近景": 40, "近景": 30, "特写": 18, "大特写": 10}
PART_SIZES = ("特写", "大特写")
MAX_SHOT, MIN_SHOT, MAX_SEG = 5, 2, 10
# 拍人时，景别 = 画面竖向框住身体的哪一段：(画面中心离地高度, 竖向半高)，按 1.7 米身高
SUBJ = {"全景": (0.9, 1.05), "中景": (1.3, 0.62), "中近景": (1.42, 0.46), "近景": (1.52, 0.33),
        "特写": (1.6, 0.17), "大特写": (1.6, 0.08)}
PART_H = {"脚": 0.06, "右脚": 0.06, "左脚": 0.06, "手": 1.0, "右手": 1.0, "左手": 1.0, "手腕": 1.05,
          "脸": 1.6, "眼睛": 1.62, "嘴": 1.55, "胸口": 1.3}
FRAME_WH = {"9:16": (90, 160), "16:9": (160, 90), "1:1": (120, 120)}
SUSPENSE_GAP = 8
EMO_WORDS = ("震惊", "惊讶", "惊恐", "绝望", "意识到", "心里", "内心", "感到", "觉得", "害怕", "恐惧", "愤怒",
             "悲伤", "难过", "紧张", "犹豫", "眼神复杂", "若有所思", "不敢相信", "恍然", "崩溃", "释然")
CATS = ("交代", "动作", "停顿", "视线", "揭示", "构图要求", "声音", "插入", "对白")


# ───────── 几何 ─────────
def norm(v):
    d = math.hypot(*v) or 1.0
    return (v[0] / d, v[1] / d)


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot(a, b):
    return a[0] * b[0] + a[1] * b[1]


def right_of(f):
    """朝向 f 的人自己的右手方向（俯视图 y 向上）。"""
    return (f[1], -f[0])


# ───────── 舞台 ─────────
class Stage:
    def __init__(self, doc):
        self.doc = doc
        self.cast = doc.get("cast", {})
        self.zones = doc["space"]["zones"]
        self.events = doc["timeline"]
        self.fixtures = doc["space"].get("fixtures", {})
        self.axis = doc["space"].get("主轴")
        self.aspect_name = str(doc.get("画幅", "9:16"))
        fw, fh = FRAME_WH.get(self.aspect_name, (90, 160))
        self.frame_wh, self.aspect = (fw, fh), fw / fh
        self.src_t = {}
        for e in self.events:
            e.setdefault("dur", 0)
            srcs = e.get("src") or []
            for s in ([srcs] if isinstance(srcs, str) else srcs):
                self.src_t.setdefault(s, e["t"])

    def height(self, w, who):
        h = self.cast.get(who, {}).get("h", 1.7)
        pose = str(w["people"].get(who, {}).get("pose", ""))
        if "倒在" in pose or "躺" in pose:
            return 0.45
        return h * (0.72 if "坐" in pose else 1.0)

    def zone_of(self, p):
        for name, z in self.zones.items():
            if eval(z["when"], {}, {"x": p[0], "y": p[1]}):  # 舞台文件是自己写的配置
                return name
        return None

    def face_vec(self, w, who):
        p = w["people"][who]
        f = p.get("face")
        if isinstance(f, list):
            return norm(sub(f, p["at"]))
        if f == "门外":
            return (0.0, 1.0)
        if f == "大厅":
            return (0.0, -1.0)
        if f in w["people"] and "at" in w["people"][f]:
            return norm(sub(w["people"][f]["at"], p["at"]))
        return (0.0, 1.0)

    def world_at(self, t):
        """回放所有在 t 之前（含 t）结束的事件，得到 t 时刻的世界。"""
        w = {"people": {}, "state": {}}
        for e in self.events:
            end = e["t"] + e["dur"]
            if end > t:
                continue
            for who, attrs in (e.get("set") or {}).items():
                w["people"].setdefault(who, {}).update(copy.deepcopy(attrs))
            if "move" in e:
                m = e["move"]
                w["people"].setdefault(m["who"], {})["at"] = m["to"]
                if "face" in m:
                    w["people"][m["who"]]["face"] = m["face"]
                if m.get("releases"):
                    w["people"][m["who"]][m["releases"]] = "空"
            if "act" in e and e["act"].get("releases"):
                w["people"][e["act"]["who"]][e["act"]["releases"]] = "空"
            if "act" in e and e["act"].get("pose_after"):
                w["people"].setdefault(e["act"]["who"], {})["pose"] = e["act"]["pose_after"]
            w["state"].update(e.get("change") or {})
            w["state"].update(e.get("state") or {})
            if "exit" in e:
                w["people"].pop(e["exit"], None)
                w["state"][e["exit"]] = "已离开"
        return w

    def events_in(self, a, b):
        out = []
        for e in self.events:
            s, end = e["t"], e["t"] + e["dur"]
            if (s < b and end > a) or (e["dur"] == 0 and a <= s < b):
                out.append(e)
        return out


# ───────── 镜头分析 ─────────
def look_point(w, shot):
    lk = shot["look"]
    if isinstance(lk, list):
        return tuple(lk)
    return tuple(w["people"][lk]["at"])


def is_person(stage, w, who):
    c = stage.cast.get(who, {}) if isinstance(who, str) else {}
    return isinstance(who, str) and who in w["people"] and not c.get("group") and not c.get("object")


def lens(stage, w, shot):
    """(水平视野角度, 机位离地高度, 俯仰角)。拍人时景别决定框住身体哪一段，视野由距离和画幅反推。"""
    cam = tuple(shot["at"])
    ch = shot.get("height", 1.6 if shot.get("pov") else 1.5)
    tgt = look_point(w, shot)
    dist = max(0.3, math.hypot(*sub(tgt, cam)))
    lk, size, part = shot.get("look"), shot["size"], shot.get("frame")
    if size in SUBJ and (part or is_person(stage, w, lk)):
        k = stage.height(w, lk) / 1.7 if is_person(stage, w, lk) else 1.0
        if part:
            th, ext = PART_H.get(part, 1.0) * (k if part in ("脸", "眼睛", "嘴", "胸口") else 1), SUBJ[size][1]
        else:
            th, ext = SUBJ[size][0] * k, SUBJ[size][1] * k
        va = math.atan2(ext, dist)
        hf = 2 * math.degrees(math.atan(math.tan(va) * stage.aspect))
        return hf, ch, math.atan2(th - ch, dist)
    pitch = 0.0
    if isinstance(lk, list) and len(lk) > 2:
        return FOV[size], ch, math.atan2(lk[2] - ch, dist)
    ang = str(shot.get("angle", ""))
    if "仰" in ang:
        pitch = math.radians(15)
    elif "俯" in ang or "高机位" in ang:
        pitch = math.radians(-20)
    return FOV[size], ch, pitch


def fixtures_seen(stage, shot, d, half):
    cam, r, out = tuple(shot["at"]), right_of(d), set()
    for name, fx in stage.fixtures.items():
        (x1, y1), (x2, y2) = fx["line"]
        n = max(2, int(math.hypot(x2 - x1, y2 - y1) / 0.5))
        for i in range(n + 1):
            q = (x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n)
            rel = sub(q, cam)
            if dot(rel, d) > 0.2 and abs(math.atan2(dot(rel, r), dot(rel, d))) <= half:
                out.add(name)
                break
    return out


def seen(stage, w, shot):
    """机位能看到谁，在画面哪一侧，正面还是背面。"""
    cam = tuple(shot["at"])
    d = norm(sub(look_point(w, shot), cam))
    half = math.radians(lens(stage, w, shot)[0] / 2)
    r = right_of(d)
    out = {}
    for who, p in w["people"].items():
        if "at" not in p or who == shot.get("pov"):
            continue
        pts = [tuple(p["at"])]
        if stage.cast.get(who, {}).get("group"):
            x0, x1 = p.get("span", [-8, 8])
            n = max(2, int((x1 - x0) / 2))
            pts = [(p["at"][0] + x0 + (x1 - x0) * i / n, p["at"][1]) for i in range(n + 1)]
        best = None
        for q in pts:
            rel = sub(q, cam)
            dist = math.hypot(*rel)
            if dist < 0.2:
                continue
            ang = math.atan2(dot(rel, r), dot(rel, d))
            if abs(ang) <= half and dot(rel, d) > 0:
                if best is None or abs(ang) < abs(best[0]):
                    best = (ang, dist, q)
        if not best:
            continue
        ang, dist, q = best
        lateral = "中间" if abs(ang) < half * 0.3 else ("右侧" if ang > 0 else "左侧")
        to_cam = norm(sub(cam, q))
        c = dot(stage.face_vec(w, who), to_cam) if not stage.cast.get(who, {}).get("object") else 0
        facing = "正面" if c > 0.35 else ("背面" if c < -0.35 else "侧面")
        out[who] = {"side": lateral, "facing": facing, "dist": dist, "ang": ang, "q": q}
    # 离主体很近的人，单独算他在主体的画面左边还是右边（这正是 016/018 写反的地方）
    lk = shot["look"]
    if isinstance(lk, str) and lk in out:
        tq = out[lk]["q"]
        tdist = out[lk]["dist"]
        for who, v in out.items():
            if who == lk:
                v["depth"] = "主体"
                continue
            gap = math.hypot(*sub(v["q"], tq))
            if gap < 1.5 and not stage.cast.get(who, {}).get("group"):
                off = dot(sub(v["q"], tq), r)
                if abs(off) > 0.1:
                    v["beside"] = f"在{lk}的画面{'右' if off > 0 else '左'}边"
            v["depth"] = "前景" if v["dist"] < tdist * 0.7 else ("背景" if v["dist"] > tdist * 1.6 else "")
    else:
        for v in out.values():
            v["depth"] = "背景" if v["dist"] > 8 else ""
    return out, d


def cam_words(stage, w, shot, d):
    cam = tuple(shot["at"])
    zone = stage.zone_of(cam)
    if shot.get("pov"):
        return f"{shot['pov']}的主观视角，在{zone}里"
    lk = shot["look"]
    if isinstance(lk, str) and lk in w["people"] and not stage.cast.get(lk, {}).get("group"):
        f = stage.face_vec(w, lk)
        rel = norm(sub(cam, w["people"][lk]["at"]))
        fwd, rgt = dot(rel, f), dot(rel, right_of(f))
        if fwd > 0.7:
            pos = "正前方"
        elif fwd < -0.7:
            pos = "正后方"
        else:
            pos = ("前" if fwd > 0 else "后") + ("右" if rgt > 0 else "左") + "侧"
        return f"机位在{zone}，在{lk}的{pos}，看向{lk}"
    toward = stage.zone_of(look_point(w, shot))
    return f"机位在{zone}，看向{toward}" if toward != zone else f"机位在{zone}"


def seg_dist(p, a, b):
    ab, ap = sub(b, a), sub(p, a)
    t = max(0.0, min(1.0, dot(ap, ab) / (dot(ab, ab) or 1)))
    return math.hypot(ap[0] - ab[0] * t, ap[1] - ab[1] * t)


def meters(x):
    if x < 0.6:
        return "贴在一起"
    if x < 1.2:
        return "约 1 米"
    return f"约 {round(x * 2) / 2:g} 米" if x < 4 else f"约 {round(x):d} 米"


def axis_side(stage, cam):
    """机位在主轴的哪一侧。主轴从“从”指向“到”，站在“从”往“到”看分左右。"""
    if not stage.axis:
        return None
    a, b = tuple(stage.axis["从"][:2]), tuple(stage.axis["到"][:2])
    u = norm(sub(b, a))
    off = u[0] * (cam[1] - a[1]) - u[1] * (cam[0] - a[0])
    return "轴上" if abs(off) < 0.5 else ("左侧" if off > 0 else "右侧")


def place_words(stage, r):
    """场地关系：机位距离、前中后景分层、主体和旁人或固定物的距离、机位在主轴哪一侧。"""
    sh, w, vis = r["shot"], r["w0"], r["vis"]
    cam, d = tuple(sh["at"]), r["dir"]
    lk = sh["look"]
    tp = look_point(w, sh)
    td = max(0.3, math.hypot(*sub(tp[:2], cam)))
    bits = []
    if isinstance(lk, str):
        bits.append(f"机位离{lk}{meters(td)}")
    else:
        bits.append(f"机位离看向的位置{meters(td)}")
    if not sh.get("frame"):
        items = []
        for who, v in vis.items():
            if who != lk:
                items.append((v["dist"], who))
        for name in r["fixtures"]:
            (x1, y1), (x2, y2) = stage.fixtures[name]["line"]
            n = max(2, int(math.hypot(x2 - x1, y2 - y1) / 0.5))
            best = None
            for i in range(n + 1):
                q = (x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n)
                rel = sub(q, cam)
                fwd = dot(rel, d)
                inside = abs(math.atan2(dot(rel, right_of(d)), fwd)) <= math.radians(r["hfov"] / 2)
                if fwd > 0.2 and inside and (best is None or fwd < best):
                    best = fwd
            if best is not None:
                items.append((best, name))
        layers = {"前景": [], "中景": [], "背景": []}
        if isinstance(lk, str) and lk in vis:
            layers["中景"].append(lk)
        for dist, name in sorted(items):
            layers["前景" if dist < td * 0.7 else ("背景" if dist > td * 1.6 else "中景")].append(name)
        lay = "；".join(f"{k}{'、'.join(v)}" for k, v in layers.items() if v)
        if lay and len(items) > 0:
            bits.append(lay)
        if isinstance(lk, str) and lk in w["people"] and not stage.cast.get(lk, {}).get("group"):
            sp = tuple(w["people"][lk]["at"])
            for who, v in sorted(vis.items(), key=lambda kv: kv[1]["dist"]):
                c = stage.cast.get(who, {})
                if who == lk or c.get("group") or v.get("depth") == "背景":
                    continue
                g = math.hypot(*sub(tuple(w["people"][who]["at"]), sp))
                if g <= 6:
                    m = meters(g)
                    bits.append(f"{lk}和{who}{m}" if m == "贴在一起" else f"{lk}和{who}相距{m}")
            near = {}
            for name in sorted(r["fixtures"]):
                g = seg_dist(sp, *[tuple(x) for x in stage.fixtures[name]["line"]])
                if g <= 8:
                    near.setdefault(meters(g) if g >= 0.6 else "不到半米", []).append(name)
            for m, names in near.items():
                bits.append(f"{lk}离{'和'.join(names)}{m}")
    side = axis_side(stage, cam)
    if side:
        nm = str(stage.axis.get("名", ""))
        ends = [x.strip() for x in nm.split("→")] if "→" in nm else None
        if ends and side != "轴上":
            bits.append(f"站在{ends[0]}朝{ends[1]}看，机位在{side[0]}边")
        elif ends:
            bits.append(f"机位在{ends[0]}和{ends[1]}的连线上")
        else:
            bits.append(f"机位在{nm or '主轴'}{'上' if side == '轴上' else side}")
    return "，".join(bits[:1]) + ("；" + "；".join(bits[1:]) if len(bits) > 1 else "")


def check_screen_order(stage, results, issues):
    """相邻两镜都拍到同两个人，他们在画面里的左右顺序不能对调（越轴的直接后果）。"""
    prev = None
    for r in results:
        if r.get("insert"):
            prev = None
            continue
        if prev is not None and not r["shot"].get("越轴"):
            ppl = [who for who in r["vis"] if who in prev["vis"] and not stage.cast.get(who, {}).get("group")
                   and not stage.cast.get(who, {}).get("object")]
            for i in range(len(ppl)):
                for j in range(i + 1, len(ppl)):
                    a, b = ppl[i], ppl[j]
                    d0 = prev["vis"][a]["ang"] - prev["vis"][b]["ang"]
                    d1 = r["vis"][a]["ang"] - r["vis"][b]["ang"]
                    if abs(d0) > 0.05 and abs(d1) > 0.05 and (d0 > 0) != (d1 > 0):
                        issues.append({"level": "WARN", "id": r["shot"]["id"],
                                       "msg": f"和上一镜 {prev['shot']['id']} 比，{a}和{b}在画面里左右对调了（越轴）。"
                                              f"是有意的，就在镜头里写 越轴: 原因"})
        prev = r


def through_glass(stage, shot, d):
    cy = shot["at"][1]
    return (cy < 0 and d[1] > 0.2) or (cy >= 0 and d[1] < -0.2)


def analyse(stage, shots_doc):
    shots = shots_doc["shots"]
    results, issues = [], []

    def flag(level, sid, msg):
        issues.append({"level": level, "id": sid, "msg": msg})

    covered, seen_acts = set(), set()
    for sh in shots:
        sid, a, b = sh["id"], sh["from"], sh["to"]
        w0, w1 = stage.world_at(a), stage.world_at(b)
        if sh.get("insert"):
            # 插入镜头：屏幕、纸上的字。没有机位几何，画面内容后期合成
            for e in stage.events_in(a, b):
                if "overlay" in e:
                    covered.add(id(e))
            results.append({"shot": sh, "dur": b - a, "w0": w0, "w1": w1, "vis": {}, "dir": (0.0, 1.0),
                            "zone": None, "glass": False, "fixtures": set(), "insert": True})
            continue
        vis, d = seen(stage, w0, sh)
        hfov, cam_h, pitch = lens(stage, w0, sh)
        fx_seen = fixtures_seen(stage, sh, d, math.radians(hfov / 2))
        vis_end, _ = seen(stage, w1, sh)
        evs = stage.events_in(a, b)
        dur = b - a
        cam_zone = stage.zone_of(tuple(sh["at"]))
        glass = through_glass(stage, sh, d)

        if dur > MAX_SHOT:
            flag("WARN", sid, f"{dur} 秒，超过单镜 {MAX_SHOT} 秒，模型容易在后半段乱加动作")
        if dur < MIN_SHOT:
            flag("WARN", sid, f"只有 {dur} 秒，太短")

        if sh.get("cut") and sh["cut"] > dur:
            flag("ERROR", sid, f"剪辑时长 {sh['cut']} 秒比生成时长 {dur} 秒还长")
        if sh.get("frame") and sh["size"] not in PART_SIZES:
            flag("ERROR", sid, f"只拍{sh['frame']}，景别却是{sh['size']}；部位镜头要用特写或大特写")

        acts, lines, sounds, holds, overlays, changes, ambient = [], [], [], [], [], [], []
        for e in evs:
            covered.add(id(e))
            if "act" in e:
                who = e["act"]["who"]
                if who not in vis and who not in vis_end:
                    continue  # 别的镜头可能拍到；有没有任何镜头拍到，最后统一查
                seen_acts.add(id(e))
                if e["act"].get("ambient"):
                    ambient.append(e)
                else:
                    acts.append(e)
                    v = vis.get(who) or vis_end.get(who)
                    if e["act"].get("needs") == "正面" and v["facing"] == "背面":
                        flag("ERROR", sid, f"“{e['act']['do']}”要看到{who}的脸，但{who}背对镜头")
            elif "move" in e:
                who = e["move"]["who"]
                if who in vis or who in vis_end:
                    if not e.get("same_action"):
                        acts.append(e)
                else:
                    flag("WARN", sid, f"{who}在这段时间移动，镜头看不到；下一镜他会在新位置")
            elif "say" in e:
                lines.append(e)
            elif "sound" in e:
                sounds.append(e)
            elif "hold" in e:
                holds.append(e)
            elif "overlay" in e:
                overlays.append(e)
            elif "change" in e:
                changes.append(e)
            elif "exit" in e:
                who = e["exit"]
                if who in vis or who in vis_end:
                    flag("ERROR", sid, f"{who}在这一镜里离开，观众会看到他是怎么走的")
        visible_changes = [e for e in changes if e.get("how") and glass]
        n_action = len(acts) + len(visible_changes)
        if n_action > 1:
            names = [e.get("act", {}).get("do") or e.get("note") or e.get("how") for e in acts + visible_changes]
            flag("ERROR", sid, f"一镜 {n_action} 个动作：{' / '.join(n for n in names if n)}；拆成几个镜头")

        # 台词：说话的人在画面里且不是背面就对口型，否则自动变画外
        voice, mouths_closed = [], []
        for e in lines:
            who = e["say"]["who"]
            v = vis.get(who)
            if v and v["facing"] != "背面":
                voice.append((who, "画内", e["say"]["line"]))
            elif v:
                voice.append((who, "画内背面", e["say"]["line"]))
            else:
                voice.append((who, "画外", e["say"]["line"]))
        for e in sounds:
            voice.append((e["sound"]["who"], "画外·" + e["sound"]["via"], e["sound"]["line"]))
        speakers_on = {who for who, kind, _ in voice if kind == "画内"}
        if sh.get("speed") == "升格" and speakers_on:
            flag("ERROR", sid, f"升格镜头里有对口型的台词（{'、'.join(speakers_on)}），慢动作会把口型拖坏")
        for who, v in vis.items():
            if stage.cast.get(who, {}).get("object") or stage.cast.get(who, {}).get("group"):
                continue
            if v["facing"] != "背面" and who not in speakers_on and v["dist"] <= 8:
                mouths_closed.append(who)
        if any(k.startswith("画外") for _, k, _ in voice):
            close = [who for who in mouths_closed if sh["size"] in ("近景", "特写", "中近景")]
            if close:
                flag("WARN", sid, f"画外音期间 {'、'.join(close)} 正脸{sh['size']}，即使写了闭嘴也有对口型风险，可改拍背面或手")

        for e in overlays:
            if e.get("on") and e["on"] not in w0["state"]:
                flag("WARN", sid, f"画面文字写在{e['on']}上，但舞台里没有{e['on']}的状态")

        results.append({
            "shot": sh, "dur": dur, "w0": w0, "w1": w1, "vis": vis, "dir": d, "zone": cam_zone,
            "glass": glass, "acts": acts, "changes": changes, "holds": holds, "voice": voice,
            "mouths_closed": mouths_closed, "overlays": overlays, "ambient": ambient,
            "cam_words": cam_words(stage, w0, sh, d), "fixtures": fx_seen,
            "hfov": hfov, "cam_h": cam_h, "pitch": pitch,
        })

    for e in stage.events:
        if "act" in e and id(e) in covered and id(e) not in seen_acts and not e["act"].get("ambient"):
            flag("ERROR", f"{e['t']}s", f"有镜头覆盖这段时间，但没有一个镜头拍得到{e['act']['who']}在“{e['act']['do']}”")
        if id(e) not in covered and ("act" in e or "say" in e or "change" in e):
            what = (e.get("act") or {}).get("do") or (e.get("say") or {}).get("line") or e.get("how") or str(e.get("change"))
            flag("WARN", f"{e['t']}s", f"没有镜头拍到：{what}")
        if id(e) not in covered and "overlay" in e:
            flag("INFO", f"{e['t']}s", f"后期合成：{e['overlay']}")
    return results, issues


# ───────── 提示词 ─────────
def hands_words(p):
    bits = []
    for h in ("左手", "右手"):
        if p.get(h) and p[h] != "空":
            bits.append(f"{h}{p[h]}")
    return "，".join(bits)


def prompt_for(stage, r):
    sh, w = r["shot"], r["w0"]
    if r.get("insert"):
        return (f"镜头：{sh['size']}，画面里只有{sh['insert']}，固定机位。时长 {r['dur']} 秒。\n"
                f"〔后期〕{sh['insert']}上的内容后期合成，生成时屏幕或纸面只留空白和光。")
    refs = [stage.zones[r["zone"]]["ref"] + "（机位所在空间）"]
    if r["glass"]:
        other = [z for z in stage.zones if z != r["zone"]][0]
        refs.append(stage.zones[other]["ref"] + "（透过玻璃看到的空间）")
    for who in r["vis"]:
        if stage.cast.get(who, {}).get("ref"):
            refs.append(stage.cast[who]["ref"])
    cam = [sh["size"] + (f"，画面里只有{sh['look']}的{sh['frame']}" if sh.get("frame") else "")]
    if sh.get("angle"):
        cam.append(sh["angle"] + (f"，机位离地约 {sh['height']} 米" if "height" in sh else ""))
    cam.append(sh.get("move") or "固定机位")
    if sh.get("speed"):
        cam.append(f"{sh['speed']}慢动作")
    L = [f"参考：{'、'.join(refs)}",
         f"镜头：{'，'.join(cam)}，{r['cam_words']}。时长 {r['dur']} 秒。"]
    part = sh.get("frame")
    frame = []
    for who, v in sorted(r["vis"].items(), key=lambda kv: kv[1]["dist"]):
        if part:
            break
        if sh["size"] in ("近景", "特写") and v.get("depth") == "背景":
            continue
        c = stage.cast.get(who, {})
        if c.get("object"):
            frame.append(f"{c.get('look', who)}在画面{v['side']}")
        else:
            where = v.get("beside") or f"在画面{v['side']}"
            depth = f"（{v['depth']}）" if v.get("depth") else ""
            frame.append(f"{who}{depth}{where}，{v['facing']}对镜头")
    if frame:
        L.append("画面：" + "；".join(frame) + "。")
    L.append("场地关系：" + place_words(stage, r) + "。")
    looks = []
    for who in r["vis"]:
        if part and who != sh["look"]:
            continue
        if r["vis"][who]["dist"] > 10:
            continue
        p, c = w["people"].get(who, {}), stage.cast.get(who, {})
        bits = [c.get("look", "")]
        if p.get("pose"):
            bits.append(p["pose"])
        hw = hands_words(p)
        if hw:
            bits.append(hw)
        bits = [b for b in bits if b]
        if bits and not c.get("object"):
            looks.append(f"{who}：{'，'.join(bits)}")
    if looks:
        L.append("人物：" + "；".join(looks) + "。")
    st = w["state"]
    scene_state = []
    if r["glass"]:
        for k in ("玻璃幕墙", "大门"):
            if k in st:
                scene_state.append(f"{k}{st[k]}")
    if scene_state:
        L.append("场景状态（开场）：" + "，".join(scene_state) + "。")
    if r["acts"]:
        for e in r["acts"]:
            if "act" in e:
                L.append(f"动作：{e['act']['who']}{e['act']['do']}。")
            else:
                L.append(f"动作：{e['move']['who']}{e.get('note', '移动到新位置')}。")
    for e in r["changes"]:
        if e.get("how") and r["glass"]:
            L.append(f"变化：{e['how']}。")
    if not r["acts"] and not [e for e in r["changes"] if e.get("how") and r["glass"]]:
        held = "、".join(e["hold"] for e in r["holds"]) or "画面里的人"
        L.append(f"动作：{held}{'除了说话，' if r['voice'] and any(k == '画内' for _, k, _ in r['voice']) else ''}保持不动。")
    for e in r["ambient"]:
        L.append(f"背景：{e['act']['who']}{e['act']['do']}。")
    if r["acts"]:
        L.append("其他人保持原来的姿势。")
    for who, kind, line in r["voice"]:
        if kind == "画内":
            L.append(f"{who}开口说：{{{line}}}")
        elif kind == "画内背面":
            L.append(f"{who}背对镜头说话（不需要对口型）：{{{line}}}")
        else:
            L.append(f"画外声音，来源是{who}（{kind}）：{{{line}}}")
    if r["mouths_closed"] and not part:
        L.append(f"嘴型：{'、'.join(r['mouths_closed'])}嘴一直闭着。")
    for e in r["overlays"]:
        L.append(f"〔后期〕{e['overlay']}，生成时不出字。")
    return "\n".join(L)


# ───────── 分段 ─────────
def segments(results):
    segs, cur = [], []
    for r in results:
        if cur:
            p = cur[-1]
            same = (p["zone"] == r["zone"] and p["shot"]["to"] == r["shot"]["from"]
                    and dot(p["dir"], r["dir"]) > 0 and sum(x["dur"] for x in cur) + r["dur"] <= MAX_SEG)
            if not same:
                segs.append(cur)
                cur = []
        cur.append(r)
    if cur:
        segs.append(cur)
    return segs


# ───────── 拆解表检查：义务有没有镜头兑现、构图要求成不成立、悬念窗口、预算 ─────────
def check_breakdown(bd, stage, results, issues):
    def flag(level, sid, msg):
        issues.append({"level": level, "id": sid, "msg": msg})

    obl = bd.get("义务") or {}
    claimed = {}
    for r in results:
        for k in r["shot"].get("兑现") or []:
            if k not in obl:
                flag("ERROR", r["shot"]["id"], f"认领了义务 {k}，但拆解表里没有这一条")
            claimed.setdefault(k, []).append(r)
    for k, o in obl.items():
        bad = [c for c in o.get("类", []) if c not in CATS]
        if bad:
            flag("ERROR", k, f"类别写错：{'、'.join(bad)}（只能用 {' / '.join(CATS)}）")
        if k not in claimed and not o.get("可省"):
            flag("ERROR", k, f"没有镜头兑现：{o.get('要', '')}")
        for r in claimed.get(k, []):
            missing = []
            for item in o.get("同框") or []:
                name, _, need = str(item).partition(":")
                if name in stage.fixtures:
                    if name not in r["fixtures"]:
                        missing.append(name)
                elif name not in r["vis"]:
                    missing.append(name)
                elif need and r["vis"][name]["facing"] != need:
                    missing.append(f"{name}（要{need}，实际{r['vis'][name]['facing']}）")
            if missing:
                flag("ERROR", r["shot"]["id"], f"认领了构图要求 {k}，但画面里没有：{'、'.join(missing)}")

    beats = bd.get("节拍") or []
    tgt = bd.get("目标时长")
    if beats and tgt:
        total = sum(b.get("秒", 0) for b in beats)
        if abs(total - tgt) > tgt * 0.15:
            flag("WARN", "预算", f"各节拍加起来 {total} 秒，目标 {tgt} 秒，差得太多")

    for s in bd.get("悬念") or []:
        t0, t1, danger = stage.src_t.get(s.get("从")), stage.src_t.get(s.get("到")), s.get("危险")
        if t0 is None or t1 is None:
            flag("INFO", "悬念", f"{s.get('从')}–{s.get('到')} 在舞台里找不到对应时间（舞台事件加 src 字段），跳过检查")
            continue
        spans = sorted((r["shot"]["from"], r["shot"]["to"]) for r in results
                       if danger in r.get("fixtures", ()) or danger in r.get("vis", {}))
        t, worst = t0, (0, t0)
        for a, b in spans:
            if b <= t0 or a >= t1:
                continue
            if a - t > worst[0]:
                worst = (a - t, t)
            t = max(t, b)
        if t1 - t > worst[0]:
            worst = (t1 - t, t)
        if worst[0] > SUSPENSE_GAP:
            flag("WARN", "悬念", f"{s['从']}–{s['到']} 悬念窗口里，{worst[1]:g} 秒起 {worst[0]:g} 秒没有拍到{danger}（上限 {SUSPENSE_GAP} 秒）")


def check_words(stage, results, issues):
    for r in results:
        p = prompt_for(stage, r)
        hit = [w for w in EMO_WORDS if w in p]
        if hit:
            issues.append({"level": "WARN", "id": r["shot"]["id"],
                           "msg": f"提示词里有情绪词：{'、'.join(hit)}。改成看得见的动作（舞台里改）"})


# ───────── 分镜草图：按机位把舞台投影成画面 ─────────
def _rng(seed):
    x = seed
    while True:
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        yield x / 0x7FFFFFFF


def frame_for(stage, r):
    sh, w = r["shot"], r["w0"]
    W, H = stage.frame_wh
    if r.get("insert"):
        return {"W": W, "H": H, "insert": sh["insert"]}
    d, p = r["dir"], r["pitch"]
    cx, cy, ch = sh["at"][0], sh["at"][1], r["cam_h"]
    F = (d[0] * math.cos(p), d[1] * math.cos(p), math.sin(p))
    R = (d[1], -d[0], 0.0)
    U = (-d[0] * math.sin(p), -d[1] * math.sin(p), math.cos(p))
    t = math.tan(math.radians(r["hfov"] / 2))

    def cs(P):
        v = (P[0] - cx, P[1] - cy, P[2] - ch)
        return (v[0] * R[0] + v[1] * R[1], v[0] * U[0] + v[1] * U[1] + v[2] * U[2], v[0] * F[0] + v[1] * F[1] + v[2] * F[2])

    def px(c):
        x, y, z = c
        return [round(max(-9e3, min(9e3, W / 2 * (1 + x / (z * t)))), 1),
                round(max(-9e3, min(9e3, H / 2 - y / (z * t) * W / 2)), 1)]

    def clip(poly, near=0.05):
        out = []
        for i, a in enumerate(poly):
            b = poly[(i + 1) % len(poly)]
            if a[2] >= near:
                out.append(a)
            if (a[2] >= near) != (b[2] >= near):
                k = (near - a[2]) / (b[2] - a[2])
                out.append(tuple(a[j] + (b[j] - a[j]) * k for j in range(3)))
        return out

    def seg(a, b, near=0.05):
        a, b = cs(a), cs(b)
        if a[2] < near and b[2] < near:
            return None
        if a[2] < near:
            a = tuple(a[j] + (b[j] - a[j]) * (near - a[2]) / (b[2] - a[2]) for j in range(3))
        if b[2] < near:
            b = tuple(b[j] + (a[j] - b[j]) * (near - b[2]) / (a[2] - b[2]) for j in range(3))
        return [px(a), px(b)]

    items = []
    horizon = round(H / 2 + math.tan(p) / t * W / 2, 1)
    st = w["state"]
    for name, fx in stage.fixtures.items():
        (x1, y1), (x2, y2) = fx["line"]
        h = fx.get("h", 1.0)
        state = str(st.get(name, ""))
        if h <= 1.2:
            s = seg((x1, y1, h), (x2, y2, h))
            if s:
                items.append({"k": "rope", "pts": s, "z": (cs((x1, y1, h))[2] + cs((x2, y2, h))[2]) / 2, "name": name})
            continue
        quad = clip([cs((x1, y1, 0)), cs((x2, y2, 0)), cs((x2, y2, h)), cs((x1, y1, h))])
        if len(quad) < 3:
            continue
        cracks = []
        top = h if ("整面" in state or "碎" in state) else (h * 0.5 if "裂" in state else 0)
        if top and "空框" not in state and "门框" not in state:
            rnd = _rng(len(name) * 97 + int(top * 10))
            L = math.hypot(x2 - x1, y2 - y1)
            for i in range(int(L / 1.1)):
                f = (i + 0.5) / int(L / 1.1)
                bx, by, z = x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, 0.0
                pts = []
                while z < top:
                    q = cs((bx, by, z))
                    if q[2] > 0.05:
                        pts.append(px(q))
                    z += 0.35 + next(rnd) * 0.3
                    bx += (next(rnd) - 0.5) * 0.5 * (x2 - x1) / (L or 1)
                    by += (next(rnd) - 0.5) * 0.5 * (y2 - y1) / (L or 1)
                if len(pts) > 1:
                    cracks.append(pts)
        style = ("gone" if re_any(state, ("空框", "门框", "敞开")) else "fall" if "碎" in state
                 else "crack" if "裂" in state else "ok")
        items.append({"k": "wall", "pts": [px(q) for q in quad], "z": sum(q[2] for q in quad) / len(quad),
                      "style": style, "cracks": cracks, "name": name})
    shard = str(st.get("碎片", ""))
    if "悬停" in shard or "落在" in shard or "碎裂下落" in str(st.get("玻璃幕墙", "")):
        rnd = _rng(7)
        hero = w["people"].get("江北", {}).get("at", [0, 5])
        for _ in range(140):
            if "落在" in shard:
                P = (-6 + 12 * next(rnd), 0.3 + 4 * next(rnd), 0.02)
            elif "悬停" in shard:
                P = (hero[0] - 3 + 6 * next(rnd), 0.5 + (hero[1] - 1.1) * next(rnd), 0.3 + 3 * next(rnd))
            else:
                P = (-8 + 16 * next(rnd), 0.2 + 2 * next(rnd), 0.2 + 4 * next(rnd))
            q = cs(P)
            if q[2] > 0.3:
                items.append({"k": "shard", "pt": px(q), "s": round(max(0.4, min(3, 0.12 / (q[2] * t) * W / 2)), 2), "z": q[2]})

    speaking = {who for who, kind, _ in r["voice"] if kind == "画内"}
    closed = set(r["mouths_closed"])
    look = sh.get("look") if isinstance(sh.get("look"), str) else None

    def figure(who, pos, face, hgt, label=True, z_off=0.0):
        a, b = cs((pos[0], pos[1], 0.0)), cs((pos[0], pos[1], hgt))
        if min(a[2], b[2]) < 0.3:
            return
        fa, fb = px(a), px(b)
        to_cam = norm(sub((cx, cy), pos))
        c, s = dot(face, to_cam), dot(face, right_of(d))
        side = "r" if s > 0 else "l"
        facing = "front" if c > 0.6 else "back" if c < -0.6 else ("f34" if c > 0.2 else "b34" if c < -0.2 else "side")
        items.append({"k": "person", "who": who, "u": fa[0], "top": fb[1], "bot": fa[1],
                      "w": round(0.46 * hgt / 1.7 / (a[2] * t) * W / 2, 2), "facing": facing, "side": side,
                      "mouth": "talk" if who in speaking else "closed" if who in closed else "",
                      "subject": who == look, "label": label, "z": a[2] + z_off})

    for who, pp in w["people"].items():
        if "at" not in pp or who == sh.get("pov"):
            continue
        c = stage.cast.get(who, {})
        if c.get("group"):
            rnd = _rng(len(who) * 31)
            face = stage.face_vec(w, who)
            first = True
            x0, x1 = pp.get("span", [-8, 8])
            n = max(2, int((x1 - x0) / 0.75))
            for row in [0.9 * k for k in range(int(pp.get("rows", 3)))]:
                for i in range(n):
                    dx = x0 + (x1 - x0) * (i + 0.5 * (row % 2)) / (n - 1) + (next(rnd) - 0.5) * 0.3
                    pos = (pp["at"][0] + dx, pp["at"][1] + row * (1 if pp["at"][1] >= 0 else -1) + (next(rnd) - 0.5) * 0.3)
                    mid = abs(dx - (x0 + x1) / 2) < 0.6
                    figure(who, pos, face, 1.6 + next(rnd) * 0.2, label=first and mid)
                    if first and mid:
                        first = False
            continue
        if c.get("object"):
            fv = stage.face_vec(w, who)
            pr = right_of(fv)
            corners = []
            for a in (-2.4, 2.4):
                for b in (-0.95, 0.95):
                    for z in (0.0, 1.9):
                        corners.append(cs((pp["at"][0] + fv[0] * a + pr[0] * b, pp["at"][1] + fv[1] * a + pr[1] * b, z)))
            if min(q[2] for q in corners) < 0.3:
                continue
            xs = [px(q) for q in corners]
            items.append({"k": "object", "who": who, "x0": min(q[0] for q in xs), "x1": max(q[0] for q in xs),
                          "y0": min(q[1] for q in xs), "y1": max(q[1] for q in xs), "z": sum(q[2] for q in corners) / 8})
            continue
        figure(who, pp["at"], stage.face_vec(w, who), stage.height(w, who))
    items.sort(key=lambda it: -it["z"])
    for it in items:
        it.pop("z", None)
    return {"W": W, "H": H, "horizon": horizon, "items": items, "part": sh.get("frame"),
            "outdoor": stage.zones.get(r["zone"], {}).get("kind") == "室外"}


def check_occlusion(stage, results, issues):
    """主体的头被更近的人挡住一半以上：俯视图看不出来，画面草图一投影就看出来了。"""
    for r in results:
        if r.get("insert") or not is_person(stage, r["w0"], r["shot"].get("look")) or r["shot"].get("frame"):
            continue
        items = [it for it in frame_for(stage, r)["items"] if it["k"] == "person"]
        idx = next((i for i, it in enumerate(items) if it["subject"]), None)
        if idx is None:
            continue
        sbj = items[idx]
        hr = (sbj["bot"] - sbj["top"]) * 0.075
        pts = [(sbj["u"] - hr + 2 * hr * i / 5, sbj["top"] + 2 * hr * j / 5) for i in range(6) for j in range(6)]
        near = [it for it in items[idx + 1:] if it["who"] != sbj["who"] or it["u"] != sbj["u"]]
        def covers(it, x, y):
            h = (it["bot"] - it["top"]) * 0.075
            return ((it["u"] - h <= x <= it["u"] + h and it["top"] <= y <= it["top"] + 2 * h)
                    or (it["u"] - it["w"] / 2 <= x <= it["u"] + it["w"] / 2 and it["top"] + 2.1 * h <= y <= it["bot"]))
        hit = sum(1 for x, y in pts if any(covers(it, x, y) for it in near))
        if hit / len(pts) > 0.5:
            who = sorted({it["who"] for it in near})
            issues.append({"level": "ERROR", "id": r["shot"]["id"],
                           "msg": f"主体{sbj['who']}的脸被前面的{'、'.join(who)}挡住了；换机位或升高机位"})


def re_any(s, words):
    return any(x in s for x in words)


# ───────── 输出 ─────────
def write_outputs(stage, results, issues, out):
    out.mkdir(parents=True, exist_ok=True)
    segs = segments(results)
    md = [f"# {stage.doc.get('title', '')} 提示词（自动生成，不要手改）", ""]
    for i, seg in enumerate(segs, 1):
        ids = "、".join(r["shot"]["id"] for r in seg)
        md.append(f"## 段 {i}：{ids}（{sum(r['dur'] for r in seg)} 秒）")
        if len(seg) > 1:
            md.append("> 同一机位区、同一方向的连续镜头，可以作为一段多镜头生成。")
        for r in seg:
            md += ["", f"### {r['shot']['id']} · {r['shot']['why']}", "", "```", prompt_for(stage, r), "```"]
        md.append("")
    (out / "提示词.md").write_text("\n".join(md), encoding="utf-8")
    rep = [f"[{x['level']}] {x['id']}: {x['msg']}" for x in issues]
    n_err = sum(1 for x in issues if x["level"] == "ERROR")
    rep.append(f"\n共 {len(issues)} 条，其中 ERROR {n_err} 条；{len(results)} 镜，{len(segs)} 段")
    (out / "问题.txt").write_text("\n".join(rep), encoding="utf-8")
    return segs, n_err


def review_data(stage, results, issues, segs, bd=None):
    bd = bd or {}
    obl = bd.get("义务") or {}
    seg_of = {r["shot"]["id"]: i for i, seg in enumerate(segs, 1) for r in seg}
    shots = []
    for r in results:
        sh = r["shot"]
        claims = [{"id": k, "req": (obl.get(k) or {}).get("要", "")} for k in sh.get("兑现") or []]
        if r.get("insert"):
            shots.append({
                "id": sh["id"], "from": sh["from"], "to": sh["to"], "why": sh["why"], "size": sh["size"],
                "camx": "插入", "cut": sh.get("cut"), "seg": seg_of[sh["id"]], "insert": sh["insert"],
                "prompt": prompt_for(stage, r), "claims": claims, "frame": frame_for(stage, r),
                "issues": [x for x in issues if x["id"] == sh["id"]],
            })
            continue
        people = []
        for who, p in r["w0"]["people"].items():
            if "at" not in p:
                continue
            people.append({"who": who, "at": p["at"], "face": list(stage.face_vec(r["w0"], who)),
                           "seen": who in r["vis"], "group": bool(stage.cast.get(who, {}).get("group")), "span": p.get("span", [-8, 8]),
                           "object": bool(stage.cast.get(who, {}).get("object"))})
        shots.append({
            "id": sh["id"], "from": sh["from"], "to": sh["to"], "why": sh["why"], "size": sh["size"],
            "camx": "·".join(x for x in (sh.get("frame"), sh.get("angle"), sh.get("move"), sh.get("speed")) if x),
            "cut": sh.get("cut"),
            "at": sh["at"], "dir": list(r["dir"]), "fov": FOV[sh["size"]], "seg": seg_of[sh["id"]],
            "people": people, "glass": r["w0"]["state"].get("玻璃幕墙", ""), "door": r["w0"]["state"].get("大门", ""),
            "prompt": prompt_for(stage, r), "claims": claims, "frame": frame_for(stage, r),
            "issues": [x for x in issues if x["id"] == sh["id"]],
        })
    beats = []
    for e in stage.events:
        kind = next((k for k in ("act", "say", "sound", "move", "change", "overlay", "hold", "exit") if k in e), None)
        if not kind:
            continue
        if kind == "act":
            txt = f"{e['act']['who']}：{e['act']['do']}"
        elif kind == "say":
            txt = f"{e['say']['who']}：“{e['say']['line']}”"
        elif kind == "sound":
            txt = f"{e['sound']['who']}（{e['sound']['via']}）：“{e['sound']['line']}”"
        elif kind == "move":
            txt = f"{e['move']['who']}移动" + (f"：{e['move']['note']}" if e["move"].get("note") else "")
        elif kind == "change":
            txt = "、".join(f"{k}→{v}" for k, v in e["change"].items())
        elif kind == "overlay":
            txt = f"后期：{e['overlay']}"
        elif kind == "exit":
            txt = f"{e['exit']}离开（不能被拍到）"
        else:
            txt = f"{e['hold']}不动" + (f"：{e['note']}" if e.get("note") else "")
        beats.append({"t": e["t"], "dur": e["dur"], "kind": kind, "txt": txt})
    general = [x for x in issues if not any(x["id"] == r["shot"]["id"] for r in results) and x["id"] not in obl]
    by = {}
    for r in results:
        for k in r["shot"].get("兑现") or []:
            by.setdefault(k, []).append(r["shot"]["id"])
    oblig = [{"id": k, "cats": o.get("类", []), "req": o.get("要", ""), "frame": o.get("同框") or [],
              "shots": by.get(k, []), "optional": bool(o.get("可省")),
              "issues": [x for x in issues if x["id"] == k]} for k, o in obl.items()]
    return {"title": stage.doc.get("title", ""), "shots": shots, "beats": beats, "general": general,
            "end": max(e["t"] + e["dur"] for e in stage.events), "aspect": stage.aspect_name,
            "oblig": oblig, "plan": bd.get("节拍") or [], "suspense": bd.get("悬念") or [], "target": bd.get("目标时长")}


def main():
    args = sys.argv[1:]
    if len(args) == 1:
        root = Path(args[0])
        st_p, sh_p, out, bd_p = root / "02_舞台.yaml", root / "03_镜头.yaml", root / "输出", root / "01_拆解.yaml"
    else:
        st_p, sh_p, out = Path(args[0]), Path(args[1]), Path(args[2])
        bd_p = Path(args[3]) if len(args) > 3 else None
    stage = Stage(yaml.safe_load(open(st_p, encoding="utf-8")))
    shots_doc = yaml.safe_load(open(sh_p, encoding="utf-8"))
    bd = yaml.safe_load(open(bd_p, encoding="utf-8")) if bd_p and bd_p.exists() else {}
    results, issues = analyse(stage, shots_doc)
    if bd:
        check_breakdown(bd, stage, results, issues)
    check_words(stage, results, issues)
    check_occlusion(stage, results, issues)
    check_screen_order(stage, results, issues)
    segs, n_err = write_outputs(stage, results, issues, out)
    data = review_data(stage, results, issues, segs, bd)
    tpl = (Path(__file__).parent / "review_template.html").read_text(encoding="utf-8")
    page = tpl.replace("%%TITLE%%", html.escape(data["title"])).replace("%%ASPECT%%", data["aspect"]).replace(
        "%%DATA%%", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
    (out / "审片.html").write_text(page, encoding="utf-8")
    print((out / "问题.txt").read_text(encoding="utf-8"))
    sys.exit(1 if n_err else 0)


if __name__ == "__main__":
    main()
