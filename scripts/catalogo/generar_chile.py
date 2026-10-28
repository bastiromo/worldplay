"""Genera src/lib/catalog/data/chile.json a partir de las fuentes verificadas.

Entradas:
  candidatos.json                         candidatos de TV filtrados de iptv-org
  verificacion/cl_resultados.json         resultado de la verificación en navegador
Uso: python3 -I generar_chile.py <dir_fuentes> <salida.json>
"""
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path
from urllib.parse import urlparse

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
CHECKED_AT = "2026-10-28T13:20:00-03:00"

cands = {c["id"]: c for c in json.load(open(SRC / "candidatos.json")) if c["country"] == "CL"}
results = json.load(open(SRC / "verificacion/cl_resultados.json"))


def slugify(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def hue(key):
    return int(hashlib.sha1(key.encode()).hexdigest()[:4], 16) % 360


def registrable(host):
    parts = (host or "").lower().split(".")
    return ".".join(parts[-2:])


TV_CATEGORY = {
    "news": "Noticias", "general": "General", "music": "Música", "religious": "Religión",
    "entertainment": "Entretenimiento", "culture": "Cultura", "education": "Educación",
    "sports": "Deportes", "legislative": "Institucional", "kids": "Infantil", "animation": "Infantil",
    "movies": "Cine y series", "series": "Cine y series", "classic": "Cine y series",
    "lifestyle": "Estilo de vida", "travel": "Estilo de vida", "cooking": "Estilo de vida",
    "business": "Economía", "outdoor": "Estilo de vida", "documentary": "Cultura",
    "comedy": "Entretenimiento", "family": "Entretenimiento", "science": "Cultura",
    "auto": "Estilo de vida", "relax": "Música", "weather": "Noticias", "public": "General",
}

# Canales de alcance nacional primero (números bajos), el resto por nombre.
TV_PRIORITY = [
    "T13EnVivo.cl", "13C.cl", "13T.cl", "13Realities.cl", "13Festival.cl", "TVPlus.cl", "UCVTV.cl",
    "TVSenado.cl", "Cooperativa.cl", "BioBioTV.cl", "ADNTV.cl", "Pauta.cl", "TeletrakTV.cl",
    "RadioDuna.cl", "LaMetroTV.cl", "RadioPudahuel.cl",
]


def tv_category(cats):
    for c in (cats or "").split(";"):
        if c in TV_CATEGORY:
            return TV_CATEGORY[c]
    return "General"


channels = []
tv_ids = [i for i in results["tv"] if i in cands]
tv_ids.sort(key=lambda i: (TV_PRIORITY.index(i) if i in TV_PRIORITY else len(TV_PRIORITY), cands[i]["name"].lower()))
for n, cid in enumerate(tv_ids, start=1):
    c = cands[cid]
    site = c["website"] or None
    if site and site.startswith("http://"):
        site = "https://" + site[len("http://"):]
    category = tv_category(c["categories"])
    channels.append({
        "slug": slugify(c["name"]) or slugify(cid),
        "number": n,
        "name": c["name"],
        "kind": "tv",
        "category": category,
        "description": f"Canal chileno de {category.lower()}." if category != "General" else "Canal chileno de programación general.",
        "stream": c["stream"],
        "format": "hls",
        "officialSite": site,
        "streamHost": c["stream_host"],
        "rightsStatus": "public-official" if c["official_domain"] else "public-listed",
        "sourceRef": f"iptv-org:{cid}",
    })


RADIO_RULES = [
    (r"news|noticia|informativ", "Noticias"),
    (r"sport|deport|futbol", "Deportes"),
    (r"relig|cristian|catol|evangel|gospel|biblia|iglesia|adventist", "Religión"),
    (r"talk|conversa|hablada", "Conversación"),
    (r"cultur|universi|educa|classical|clasica|jazz", "Cultura"),
]


def radio_category(tags, name):
    text = f"{tags} {name}".lower()
    for pattern, cat in RADIO_RULES:
        if re.search(pattern, text):
            return cat
    return "Música"


seen_streams, seen_names = set(), set()
radio_n = 201
for uuid, name, url, homepage, tags, state, codec, bitrate, votes, lang in results["radios"]:
    p = urlparse(url)
    stream_key = f"{p.hostname}{'/'.join(p.path.split('/')[:2])}"
    home_host = urlparse(homepage).hostname if homepage else None
    if not home_host or registrable(home_host) == registrable(p.hostname):
        # Sin sitio propio distinto del servidor de streaming: no hay a quién atribuir la emisión.
        if not home_host:
            continue
    if stream_key in seen_streams:
        continue
    name_key = slugify(re.sub(r"^radio\s+", "", name, flags=re.I))
    if name_key in seen_names:
        continue
    seen_streams.add(stream_key)
    seen_names.add(name_key)
    category = radio_category(tags, name)
    place = f" de {state.strip()}" if state and state.strip() else ""
    site = homepage if homepage.startswith("https://") else "https://" + homepage.split("://", 1)[-1]
    slug = slugify(name)
    if any(ch["slug"] == slug for ch in channels):
        slug = f"{slug}-radio"
    channels.append({
        "slug": slug,
        "number": radio_n,
        "name": name,
        "kind": "radio",
        "category": category,
        "description": f"Emisora chilena{place}." if category == "Música" else f"Emisora chilena{place}, {category.lower()}.",
        "stream": url,
        "format": "audio",
        "officialSite": site,
        "streamHost": p.hostname,
        "rightsStatus": "public-official" if registrable(home_host) == registrable(p.hostname) else "public-listed",
        "sourceRef": f"radio-browser:{uuid}",
    })
    radio_n += 1

for ch in channels:
    ch["hue"] = hue(ch["slug"])
    ch["countryCode"] = "CL"
    ch["language"] = "Español"
    ch["lastCheckedAt"] = CHECKED_AT

# Slugs únicos garantizados.
seen = {}
for ch in channels:
    base = ch["slug"]
    if base in seen:
        seen[base] += 1
        ch["slug"] = f"{base}-{seen[base]}"
    else:
        seen[base] = 1

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(channels, ensure_ascii=False, indent=1))
tv = [c for c in channels if c["kind"] == "tv"]
radio = [c for c in channels if c["kind"] == "radio"]
print("TV:", len(tv), "| radio:", len(radio))
print("TV public-official:", sum(c["rightsStatus"] == "public-official" for c in tv))
print("radio public-official:", sum(c["rightsStatus"] == "public-official" for c in radio))
from collections import Counter
print("categorías TV:", Counter(c["category"] for c in tv))
print("categorías radio:", Counter(c["category"] for c in radio))
print("primeros TV:", [c["name"] for c in tv[:16]])
print("primeras radios:", [c["name"] for c in radio[:16]])
