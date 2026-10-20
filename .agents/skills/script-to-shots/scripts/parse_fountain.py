#!/usr/bin/env python3
"""把 Fountain 剧本切成带编号的元素，供“剧本转分镜”第一步使用。

用法：python3 parse_fountain.py 剧本.fountain [输出.yaml]
只做机械切分，不做任何理解：场景标题、动作段、对白、INSERT、转场。
"""
import re, sys

HEADING = re.compile(r"^(INT\.|EXT\.|INT/EXT\.|I/E\.)\s*(.+?)\s+-\s+(.+)$")
TRANSITION = re.compile(r"^[A-Z ]+(TO:|IN:|OUT\.)$")


def blocks(text):
    body = re.split(r"\n\s*\n", text.strip(), maxsplit=0)
    # 跳过开头的标题页（Key: value）
    if body and re.match(r"^\w[\w ]*:", body[0]):
        body = body[1:]
    return [b.strip("\n") for b in body if b.strip()]


def parse(text):
    out, scene, n = [], None, {"S": 0, "A": 0, "D": 0, "I": 0}
    in_insert = None

    def nid(k):
        n[k] += 1
        return f"{k}{n[k]:02d}"

    for b in blocks(text):
        lines = b.split("\n")
        first = lines[0].strip()
        if first.startswith(".INSERT"):
            in_insert = {"id": nid("I"), "type": "insert", "scene": scene,
                         "object": first.split("-", 1)[1].strip(), "text": ""}
            out.append(in_insert)
            continue
        if first == "BACK TO SCENE":
            in_insert = None
            continue
        if in_insert is not None:
            in_insert["text"] = (in_insert["text"] + " " + b.replace("\n", " ")).strip()
            continue
        m = HEADING.match(first)
        if m:
            scene = nid("S")
            out.append({"id": scene, "type": "scene", "ie": m.group(1).rstrip("."),
                        "place": m.group(2), "time": m.group(3)})
            continue
        if TRANSITION.match(first):
            out.append({"id": "T", "type": "transition", "text": first, "scene": scene})
            continue
        if first.startswith("@"):
            cue = first[1:]
            ext = re.findall(r"\(([^)]+)\)", cue)
            name = re.sub(r"\s*\([^)]*\)", "", cue).strip()
            rest = [l.strip() for l in lines[1:]]
            paren = rest.pop(0)[1:-1] if rest and rest[0].startswith("(") else ""
            out.append({"id": nid("D"), "type": "dialogue", "scene": scene, "who": name,
                        "ext": ext[0] if ext else "", "paren": paren, "line": " ".join(rest)})
            continue
        out.append({"id": nid("A"), "type": "action", "scene": scene, "text": " ".join(l.strip() for l in lines)})
    return out


def dump(items):
    rows = []
    for it in items:
        if it["type"] == "scene":
            rows.append(f"\n# {it['id']}  {it['ie']}. {it['place']} - {it['time']}")
        elif it["type"] == "action":
            rows.append(f"{it['id']}  动作  {it['text']}")
        elif it["type"] == "dialogue":
            ext = f"（{it['ext']}）" if it["ext"] else ""
            paren = f"［{it['paren']}］" if it["paren"] else ""
            rows.append(f"{it['id']}  对白  {it['who']}{ext}{paren}：{it['line']}")
        elif it["type"] == "insert":
            rows.append(f"{it['id']}  插入  {it['object']}：{it['text']}")
        else:
            rows.append(f"      转场  {it['text']}")
    return "\n".join(rows).strip() + "\n"


if __name__ == "__main__":
    items = parse(open(sys.argv[1], encoding="utf-8").read())
    text = dump(items)
    if len(sys.argv) > 2:
        open(sys.argv[2], "w", encoding="utf-8").write(text)
    print(text)
