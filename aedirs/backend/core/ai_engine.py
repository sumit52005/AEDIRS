"""
AEDIRS AI Classification Engine
NLP keyword-based classification (MVP) — swap in DistilBERT later.
"""
import math
from typing import Optional

CATEGORY_KEYWORDS = {
    "Flood":             ["flood","water","submerged","drowning","river overflow","waterlogging","stranded"],
    "Fire":              ["fire","burning","smoke","flames","blast","explosion"],
    "Road Accident":     ["accident","collision","crash","vehicle","expressway","hit"],
    "Medical Emergency": ["heart attack","unconscious","seizure","breathing","medical","hospital","fainted"],
    "Building Collapse": ["collapsed","collapse","structure fell","rubble","trapped under","storey","debris"],
}

PRIORITY_KEYWORDS = {
    "P1": ["trapped","critical","life threatening","many people","mass casualty","dying",
           "collapsed","rising fast","30 people","stranded","unconscious","multiple"],
    "P2": ["injured","urgent","spreading","blocked","severe","fire spreading"],
    "P3": ["moderate","contained","minor injury","some damage"],
    "P4": ["minor","small","no injury","property damage only"],
}

TYPE_MAP = {
    "Flood":             "Flood",
    "Fire":              "Fire",
    "Medical Emergency": "Medical",
    "Road Accident":     "Medical",
    "Building Collapse": "Multi",
    "Unknown":           "Multi",
}

def classify_incident(text: str) -> str:
    t = (text or "").lower()
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(kw in t for kw in kws):
            return cat
    return "Unknown"

def assign_priority(text: str) -> str:
    t = (text or "").lower()
    for p, kws in PRIORITY_KEYWORDS.items():
        if any(kw in t for kw in kws):
            return p
    return "P3"

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def find_nearest_team(category: str, lat: float, lng: float, teams: list) -> Optional[dict]:
    needed = TYPE_MAP.get(category, "Multi")
    pool = [t for t in teams if t["status"] == "Available" and t["type"] == needed]
    if not pool:
        pool = [t for t in teams if t["status"] == "Available"]
    if not pool:
        return None
    nearest = min(pool, key=lambda t: haversine(lat, lng, t["lat"], t["lng"]))
    dist = haversine(lat, lng, nearest["lat"], nearest["lng"])
    nearest["eta"] = max(3, round(dist * 5))
    return nearest
