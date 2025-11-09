from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import itertools

app = Flask(__name__)
CORS(app)

# ---- In-memory "DB" ----
id_seq = itertools.count(1000)

USERS = {
    "student@demo.com": {"password": "demo123", "name": "Student One", "role": "student", "id": 1, "section":"A",
                         "skills":["python","ml"], "interests":["cv","nlp"], "availability":["mon","wed"]},
    "faculty@demo.com": {"password": "demo123", "name": "Prof. Ada", "role": "faculty", "id": 2, "section":"FAC",
                         "skills":["supervision"], "interests":["pbl"], "availability":["tue","thu"]},
    "admin@demo.com":   {"password": "demo123", "name": "Admin Root", "role": "admin", "id": 3, "section":"ADM",
                         "skills":[], "interests":[], "availability":[]},
    "student2@demo.com":{"password": "demo123", "name": "Student Two", "role": "student", "id": 4, "section":"B",
                         "skills":["react","ui"], "interests":["web"], "availability":["tue","sat"]},
    "student3@demo.com":{"password": "demo123", "name": "Student Three", "role": "student", "id": 5, "section":"C",
                         "skills":["java","dsa"], "interests":["backend"], "availability":["fri"]},
    "student4@demo.com":{"password": "demo123", "name": "Student Four", "role": "student", "id": 6, "section":"D",
                         "skills":["db","sql"], "interests":["data"], "availability":["mon","thu"]},
    "student5@demo.com":{"password": "demo123", "name": "Student Five", "role": "student", "id": 7, "section":"E",
                         "skills":["python","dsa"], "interests":["systems"], "availability":["sun"]},
}

# users by id for reverse lookup
USERS_BY_ID = {v["id"]: {"email": k, **v} for k,v in USERS.items()}

TEAMS = {}  # team_id -> {id, name, members:[user_id], status, locked}
INVITES = {}  # invite_id -> {id, from_user, to_user, team_id, status}
FEEDBACK = {} # feedback_id -> {id, team_id, rubric, comments, score, status}
DELIVERABLES = {} # by team_id -> list of {id, title, version, ts}
SLOTS = {}  # team_id -> list of slots
NOTIFICATIONS = {}  # user_id -> list of {id, type, text, ts, read:false}
MILESTONES = [
    {"id": 1, "name": "Proposal", "due_ts": 1731023400},
    {"id": 2, "name": "SRS", "due_ts": 1732223000},
    {"id": 3, "name": "Mid Evaluation", "due_ts": 1735001400},
    {"id": 4, "name": "Final", "due_ts": 1737589800},
]

def notify(user_id, typ, text):
    lst = NOTIFICATIONS.setdefault(user_id, [])
    lst.append({"id": next(id_seq), "type": typ, "text": text, "ts": int(time.time()), "read": False})

def user_from_token():
    # mock: token is just email for demo
    token = request.headers.get("Authorization","").replace("Bearer ","").strip()
    if token and token in USERS:
        u = USERS[token].copy()
        u["email"] = token
        return u
    return None

@app.get("/health")
def health():
    return jsonify({"status":"ok","service":"Acadmate eXQ API"})

@app.post("/login")
def login():
    data = request.json or {}
    email = data.get("email", "")
    password = data.get("password", "")
    u = USERS.get(email)
    if u and u["password"] == password:
        return jsonify({"ok": True, "name": u["name"], "role": u["role"], "token": email, "id": u["id"]})
    return jsonify({"ok": False, "error":"Invalid credentials"}), 401

@app.get("/me")
def me():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    return jsonify({k:v for k,v in u.items() if k not in ["password"]})

@app.put("/me")
def me_update():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    data = request.json or {}
    for k in ["skills","interests","availability","section","name"]:
        if k in data: USERS[u["email"]][k] = data[k]
    return jsonify({"ok": True})

# ---- Notifications ----
@app.get("/notifications")
def notifications_list():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    return jsonify(NOTIFICATIONS.get(u["id"], []))

@app.post("/notifications/read")
def notifications_read():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    ids = (request.json or {}).get("ids", [])
    for n in NOTIFICATIONS.get(u["id"], []):
        if n["id"] in ids: n["read"] = True
    return jsonify({"ok": True})

# ---- Teams ----
@app.get("/teams/me")
def teams_me():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    for t in TEAMS.values():
        if u["id"] in t["members"]:
            return jsonify(t)
    return jsonify({"id": None, "name": None, "members": [], "status":"unassigned", "locked": False})

@app.get("/teams/suggestions")
def teams_suggestions():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    # simple scoring: +2 skill overlap, +1 interest overlap, -100 if same section (to enforce cross-section)
    mine = USERS[u["email"]]
    res = []
    for email, cand in USERS.items():
        if cand["id"] == mine["id"] or cand["role"] != "student":
            continue
        # skip if already teamed
        already = any(cand["id"] in t["members"] for t in TEAMS.values())
        if already: continue
        score = 0
        score += 2 * len(set(mine.get("skills",[])) & set(cand.get("skills",[])))
        score += 1 * len(set(mine.get("interests",[])) & set(cand.get("interests",[])))
        if cand.get("section") == mine.get("section"): score -= 100
        res.append({
            "userId": cand["id"],
            "name": cand["name"],
            "section": cand.get("section"),
            "skills": cand.get("skills", []),
            "interests": cand.get("interests", []),
            "score": score
        })
    res.sort(key=lambda x: x["score"], reverse=True)
    return jsonify(res[:8])

@app.post("/teams/invite")
def teams_invite():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    to_user = (request.json or {}).get("toUserId")
    if not to_user: return jsonify({"error":"toUserId required"}), 400
    # ensure inviter has or creates a team
    my_team = None
    for t in TEAMS.values():
        if u["id"] in t["members"]:
            my_team = t; break
    if not my_team:
        tid = next(id_seq)
        my_team = {"id": tid, "name": f"Team-{tid}", "members": [u["id"]], "status":"forming", "locked": False}
        TEAMS[tid] = my_team
    inv_id = next(id_seq)
    INVITES[inv_id] = {"id": inv_id, "from_user": u["id"], "to_user": to_user, "team_id": my_team["id"], "status":"pending"}
    notify(to_user, "INVITE", f"You have been invited to join {my_team['name']} by {u['name']}")
    return jsonify({"ok": True, "inviteId": inv_id, "teamId": my_team["id"]})

@app.post("/teams/respond")
def teams_respond():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    data = request.json or {}
    inv_id = data.get("inviteId"); action = data.get("action")
    inv = INVITES.get(inv_id)
    if not inv or inv["to_user"] != u["id"]:
        return jsonify({"error":"invalid invite"}), 400
    if action not in ["accept","decline"]:
        return jsonify({"error":"invalid action"}), 400
    inv["status"] = action
    team = TEAMS.get(inv["team_id"])
    if action == "accept" and team and not team["locked"]:
        if u["id"] not in team["members"]:
            team["members"].append(u["id"])
        notify(inv["from_user"], "INVITE_ACCEPTED", f"{u['name']} accepted your invite to {team['name']}")
    elif action == "decline":
        notify(inv["from_user"], "INVITE_DECLINED", f"{u['name']} declined your invite to {team['name']}")
    return jsonify({"ok": True})

@app.post("/teams/lock")
def teams_lock():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    # lock the team if size >=4
    for t in TEAMS.values():
        if u["id"] in t["members"]:
            if len(t["members"]) >= 4:
                t["locked"] = True; t["status"] = "locked"
                for uid in t["members"]:
                    notify(uid, "TEAM_LOCKED", f"{t['name']} is now locked with {len(t['members'])} members")
                return jsonify({"ok": True, "team": t})
            return jsonify({"ok": False, "error":"Need at least 4 members to lock"}), 400
    return jsonify({"ok": False, "error":"No team found"}), 400

# ---- Deliverables & Feedback ----
@app.get("/teams/<int:team_id>/deliverables")
def deliv_list(team_id):
    return jsonify(DELIVERABLES.get(team_id, []))

@app.post("/teams/<int:team_id>/deliverables")
def deliv_add(team_id):
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    data = request.json or {}
    title = data.get("title","Submission")
    lst = DELIVERABLES.setdefault(team_id, [])
    version = len(lst) + 1
    d = {"id": next(id_seq), "title": title, "version": version, "ts": int(time.time())}
    lst.append(d)
    notify(u["id"], "SUBMISSION", f"Uploaded {title} v{version}")
    return jsonify({"ok": True, "deliverable": d})

@app.get("/faculty/queue")
def faculty_queue():
    # pending teams = all teams not yet given feedback for latest submission
    rows = []
    for tid, lst in DELIVERABLES.items():
        latest = max(lst, key=lambda x: x["version"]) if lst else None
        if latest:
            # if no published feedback for this version, it's pending
            f = [f for f in FEEDBACK.values() if f["team_id"]==tid and f.get("for_version")==latest["version"] and f["status"]=="published"]
            if not f:
                rows.append({"teamId": tid, "teamName": TEAMS[tid]["name"], "deliverable": latest})
    return jsonify(rows)

@app.post("/teams/<int:team_id>/feedback")
def submit_feedback(team_id):
    u = user_from_token()
    if not u or u["role"] != "faculty": return jsonify({"error":"forbidden"}), 403
    data = request.json or {}
    fb = {
        "id": next(id_seq),
        "team_id": team_id,
        "rubric": data.get("rubric", {"clarity":0,"implementation":0,"viva":0}),
        "comments": data.get("comments",""),
        "score": data.get("score",0),
        "for_version": data.get("for_version", 1),
        "status": "draft"
    }
    FEEDBACK[fb["id"]] = fb
    return jsonify({"ok": True, "feedbackId": fb["id"]})

@app.post("/teams/<int:team_id>/feedback/publish")
def publish_feedback(team_id):
    u = user_from_token()
    if not u or u["role"] != "faculty": return jsonify({"error":"forbidden"}), 403
    data = request.json or {}
    fid = data.get("feedbackId")
    fb = FEEDBACK.get(fid)
    if not fb or fb["team_id"] != team_id: return jsonify({"error":"invalid feedback"}), 400
    fb["status"] = "published"
    for uid in TEAMS.get(team_id,{}).get("members",[]):
        notify(uid, "FEEDBACK", f"Feedback published for {TEAMS[team_id]['name']} (score {fb['score']})")
    return jsonify({"ok": True})

# ---- Scheduling ----
@app.get("/schedule/slots")
def sched_slots():
    team_id = int(request.args.get("teamId","0"))
    return jsonify(SLOTS.get(team_id, []))

@app.post("/schedule/slots")
def sched_create():
    u = user_from_token()
    if not u or u["role"] != "faculty": return jsonify({"error":"forbidden"}), 403
    data = request.json or {}
    team_id = data.get("teamId")
    start_ts = data.get("start_ts"); end_ts = data.get("end_ts")
    slot = {"id": next(id_seq), "team_id": team_id, "start_ts": start_ts, "end_ts": end_ts, "status":"proposed"}
    SLOTS.setdefault(team_id, []).append(slot)
    for uid in TEAMS.get(team_id,{}).get("members",[]):
        notify(uid, "MEETING", f"Meeting proposed for team {TEAMS[team_id]['name']}")
    return jsonify({"ok": True, "slot": slot})

@app.post("/schedule/book")
def sched_book():
    u = user_from_token()
    if not u: return jsonify({"error":"unauthorized"}), 401
    data = request.json or {}
    team_id = data.get("teamId"); slot_id = data.get("slotId")
    slots = SLOTS.get(team_id, [])
    for s in slots:
        if s["id"] == slot_id:
            s["status"] = "booked"
            notify(u["id"], "MEETING_BOOKED", f"Booked a meeting slot for team {team_id}")
            return jsonify({"ok": True})
    return jsonify({"error":"slot not found"}), 404

# ---- Milestones ----
@app.get("/milestones")
def milestones():
    return jsonify(MILESTONES)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)