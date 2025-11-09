# Acadmate 

This build adds real flows on top of your skeleton:
- Auth with roles (student/faculty/admin) via demo buttons
- Team finder (suggestions, invite, accept/decline, lock team)
- Deliverables with versioning (mock upload)
- Faculty review queue with rubric + publish feedback
- Notifications bell with unread count + mark-as-read
- Milestones timeline
- Resources page
- Progress placeholder

## Run
### Backend
```
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

npm audit fix --force


### Frontend
```
cd frontend
npm install
npm i -D @vitejs/plugin-react
npm run dev
```
### Demo accounts
- student@demo.com / demo123
- faculty@demo.com / demo123
- admin@demo.com / demo123

> The API uses the token as the email (mock). No database required.

