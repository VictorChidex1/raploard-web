# How to Clone the Raploard Engine (The Graceboy Protocol) 🧬

To create a new website for **Graceboy Micl** using this codebase, follow these steps.

## Option A: The "Terminal" Method (Fastest) ⚡️

Open your terminal and run these commands one at a time.

```bash
# 1. Go to the parent folder (Vibe Coding)
cd "/Users/mac/Documents/Vibe Coding"

# 2. Duplicate the folder
# This copies 'raploard-web' to a new folder named 'graceboy-web'
cp -R raploard-web graceboy-web

# 3. Enter the new folder
cd graceboy-web

# 4. Reset the "Brain" (Git)
# We remove the old git history so Graceboy starts fresh.
rm -rf .git
git init

# 5. Open in VS Code
code .
```

## Option B: The "Finder" Method (Visual) 🖥️

1.  Open **Finder**.
2.  Navigate to `Documents > Vibe Coding`.
3.  Right-click on `raploard-web`.
4.  Select **Duplicate**.
5.  Rename the new folder `raploard-web copy` to `graceboy-web`.
6.  Open this new folder in VS Code.

---

## 🛑 POST-CLONE CHECKLIST (Crucial)

Once you are inside the new `graceboy-web` folder:

1.  **Update Config**: Open `src/config.ts` and change `"Raploard"` to `"Graceboy Micl"`.
2.  **Update Theme**: Open `tailwind.config.js` and change the `gold` hex code to Graceboy's color.
3.  **Clean Assets**: Go to `public/` and delete `raploard.jpeg`. Drag in `graceboy.jpg`.
4.  **Backend Swap (Critical)**:
    - Go to [Firebase Console](https://console.firebase.google.com/) and create a new project: `graceboy-web`.
    - Create a "Web App" inside it and copy the new SDK Keys.
    - Open `.env` in the new folder.
    - **DELETE** the old keys (Raploard's) and **PASTE** the new keys (Graceboy's).
    - _Why?_ If you don't do this, Graceboy's fans will be signed up to Raploard's newsletter!
5.  **Start Server**: Run `npm run dev` to see the new site!

---

_Verified by Lead Architect._
