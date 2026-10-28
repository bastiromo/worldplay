"""Filtra candidatos de iptv-org según la política de WorldPlay.

Uso: python3 -I filtrar_iptv.py <directorio_datos> <salida.json>
"""
import csv
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

DATA = Path(sys.argv[1])
OUT = Path(sys.argv[2])
COUNTRIES = ["cl", "ar", "pe", "co", "mx", "br", "es", "pt"]

# Plataformas agregadoras: su contenido está licenciado para sus propias apps.
AGGREGATOR_HINTS = [
    "pluto", "samsung", "rakuten", "plex", "stirr", "xumo", "roku", "lg", "tcl",
    "amagi", "wurl", "tubi", "distro", "vix", "freevee", "runtime", "sportstribal",
]
TOKEN_RE = re.compile(r"(token|hdnts|hdnea|wmsauth|signature|sig=|expires|auth|key=|acl=|hmac|policy=)", re.I)

blocked = {row["channel"] for row in csv.DictReader(open(DATA / "blocklist.csv"))}
channels = {row["id"]: row for row in csv.DictReader(open(DATA / "channels.csv"))}
feeds = {}
for row in csv.DictReader(open(DATA / "feeds.csv")):
    feeds[(row["channel"], row["id"])] = row


def registrable(host: str) -> str:
    parts = host.lower().split(".")
    if len(parts) >= 3 and parts[-2] in {"com", "gob", "gov", "org", "net", "edu", "co"} and len(parts[-1]) == 2:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


def parse_m3u(path: Path):
    entries, meta = [], None
    for raw in path.read_text(errors="ignore").splitlines():
        line = raw.strip()
        if line.startswith("#EXTINF"):
            meta = {"extinf": line, "opts": []}
        elif line.startswith("#EXTVLCOPT") or line.startswith("#KODIPROP") or line.startswith("#EXTHTTP"):
            if meta is not None:
                meta["opts"].append(line)
        elif line and not line.startswith("#") and meta is not None:
            meta["url"] = line
            entries.append(meta)
            meta = None
    return entries


kept, rejected = [], {}


def reject(reason):
    rejected[reason] = rejected.get(reason, 0) + 1


for cc in COUNTRIES:
    for e in parse_m3u(DATA / f"streams_{cc}.m3u"):
        m = re.search(r'tvg-id="([^"]*)"', e["extinf"])
        tvg = m.group(1) if m else ""
        title = e["extinf"].split(",", 1)[-1].strip()
        channel_id, _, feed_id = tvg.partition("@")
        url = e["url"]
        parsed = urlparse(url)
        host = parsed.hostname or ""

        if not channel_id or channel_id not in channels:
            reject("sin canal identificado en la base de datos"); continue
        ch = channels[channel_id]
        if channel_id in blocked:
            reject("bloqueado a petición del titular o por la base"); continue
        if ch["is_nsfw"] == "TRUE":
            reject("contenido adulto"); continue
        if ch["closed"]:
            reject("canal cerrado"); continue
        if "Geo-blocked" in title or "Not 24/7" in title:
            reject("geobloqueado o no emite 24 h"); continue
        if e["opts"]:
            reject("requiere falsear referer/user-agent u otras cabeceras"); continue
        if parsed.scheme != "https":
            reject("sin https"); continue
        if TOKEN_RE.search(parsed.query) or TOKEN_RE.search(parsed.path):
            reject("URL con token o firma"); continue
        network = (ch["network"] + " " + ch["owners"]).lower()
        if any(h in host.lower() or h in network for h in AGGREGATOR_HINTS):
            reject("plataforma agregadora"); continue
        if not parsed.path.endswith(".m3u8"):
            reject("formato distinto de HLS"); continue

        website = ch["website"]
        site_host = urlparse(website).hostname or "" if website else ""
        same_domain = bool(site_host) and registrable(site_host) == registrable(host)
        feed = feeds.get((channel_id, feed_id), {})
        kept.append({
            "id": channel_id,
            "feed": feed_id,
            "name": ch["name"],
            "title": re.sub(r"\s*\[.*?\]", "", title),
            "country": ch["country"],
            "categories": ch["categories"],
            "network": ch["network"],
            "owners": ch["owners"],
            "website": website,
            "languages": feed.get("languages", ""),
            "stream": url,
            "stream_host": host,
            "official_domain": same_domain,
        })

# Una entrada por canal: preferir la que está en el dominio oficial.
best = {}
for k in kept:
    cur = best.get(k["id"])
    if cur is None or (k["official_domain"] and not cur["official_domain"]):
        best[k["id"]] = k

result = sorted(best.values(), key=lambda x: (x["country"], not x["official_domain"], x["name"]))
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1))
print("candidatos:", len(result), "en dominio oficial:", sum(r["official_domain"] for r in result))
for reason, n in sorted(rejected.items(), key=lambda x: -x[1]):
    print(f"  descartados ({reason}): {n}")
by_c = {}
for r in result:
    by_c.setdefault(r["country"], [0, 0])
    by_c[r["country"]][0] += 1
    by_c[r["country"]][1] += r["official_domain"]
print("por país (total, dominio oficial):", by_c)
