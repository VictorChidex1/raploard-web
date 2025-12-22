# Raploard Web Project - The Textbook 📚

## Introduction

Welcome to the internal documentation for the **Raploard Official Website**. This document is written for you, the visionary behind the project, to explain exactly _what_ we built, _how_ it works, and _why_ we made certain technical choices. Think of this as the "Owner's Manual" for your code.

---

## 1. The Vision & Aesthetic 🎨

We built this site to feel **Premium**, **Industry-Standard**, and **Bold**.

- **Theme**: "Dark Luxury". We established a deep black background (`#09090b`) to make the content pop.
- **Accent**: "Raploard Gold" (`#FFD700`). Used sparingly for buttons, highlights, and interactions to guide the user's eye.
- **Typography**:
  - **Headers**: `Oswald` - Tall, bold, and commanding. Used for "RAPLOARD", "DISCOGRAPHY", and section titles.
  - **Body**: `Inter` - Clean, legible, and modern. Used for navigation links and long text.

---

## 2. Project Architecture (The Skeleton) 🦴

We restructured the folders to be professional and scalable (easy to grow).

### `src/` (Source Folder)

This is where all the action happens.

#### `components/`

These are the reusable "Lego blocks" of your website.

- **`Navbar.tsx`**: The top navigation bar. It has a special "glassmorphism" effect that blurs the background when you scroll. It also adapts to mobile screens automatically.
- **`Footer.tsx`**: The bottom section with social links and newsletter signup. Includes the **Join The Movement** form connected to Firebase.
- **`TourDates.tsx`**: Displays the list of shows. It has logic to handle status like "Sold Out" or "Selling Fast".
- **`LatestRelease.tsx`**: Displays the new EP.
- **`ui/`**: A special folder for generic, dumb components.
  - **`Button.tsx`**: A smart button component. We can tell it to be `variant="primary"` (Gold) or `variant="outline"` (See-through). It handles hover animations automatically.
  - **`VideoModal.tsx`**: The popup window for playing YouTube videos. It strictly accepts a `videoId` to prevent broken embeds.
  - **`ScrollToTop.tsx`**: A floating button that listens for scroll events and smoothly returns the user to the top of the page.

#### `pages/`

These correspond to the actual pages users visit.

- **`Hero.tsx`**: The landing page masterpiece.
- **`Music.tsx`**: The discography page.
- **`About.tsx`**: The biography page.
- **`Contact.tsx`**: The booking form.

#### `lib/`

- **`firebase.ts`**: The connection layer to your backend. It exports `db` (Database) and `analytics`.
- **`utils.ts`**: A small helper file that allows us to merge strict class names safely (using `clsx` and `tailwind-merge`).

---

## 3. Key Technologies Explained (The Engine) ⚙️

### **React & Vite**

The core framework and build tool. Blazingly fast and modular.

### **Tailwind CSS**

The styling engine. We use utility classes and **CSS Variables** (`var(--brand-dark)`) for consistent theming.

### **Framer Motion**

The animation library. It powers the smooth fades, slide-ups, and hover effects that give the site its "premium" feel.

### **Firebase (BaaS)**

Your Backend-as-a-Service.

- **Authentication**: Ready for future admin login.
- **Firestore**: Stores "Newsletter" signatures (and soon Tour Dates).
- **Security**: API Keys are hidden in `.env` and strictly excluded from GitHub.

---

## 4. Deep Dive: Refining the Hero Section 🖼️

_Updated Dec 22_ - **The "Animation Upgrade"**

We completely overhauled the Hero section to include "Cinematic" and "Interactive" elements. Here is the breakdown:

### A. The "Cinematic Spotlight" (Mouse Tracking)

**Goal**: Make the dark background feel "alive" by having a subtle golden torch follow the user's cursor.

**Logic**:
We use `useMotionValue` to store the X and Y coordinates of the mouse. We don't use React Context or State because those trigger "re-renders" (slow). Motion Values bypass React's render cycle for 60FPS performance.

**Code Breakdown**:

1.  **`mouseXPixels` / `mouseYPixels`**: These track exactly where your mouse is on the screen in pixels.
2.  **`useSpring`**: This is the secret sauce. Instead of the spotlight jumping instantly to your cursor, it "springs" towards it with `damping: 20` and `stiffness: 300`. This adds weight and makes it feel physical.
3.  **`radial-gradient`**: We use a CSS gradient as a mask. The center is transparent gold, fading out to nothing. By updating the `at ${spotlightX}px ${spotlightY}px` part dynamically, the light moves.

### B. The "3D Parallax" Effect

**Goal**: Create a sense of depth where the text floats _above_ the background.

**Logic**:
When you move your mouse **Left**, the background moves slightly **Right** (e.g., `2%`), and the text moves **Left** (e.g., `-5%`). This separation creates a 3D illusion called "Parallax".

**Code Breakdown**:

```tsx
const bgX = useTransform(mouseXPct, [-0.5, 0.5], ["2%", "-2%"]);
```

- **Input**: `mouseXPct` (moves from -0.5 on left edge to 0.5 on right edge).
- **Output**: Maps that input to a string range `"2%"` to `"-2%"`.
- **Result**: A subtle shift that makes the user feel like they are looking _into_ the screen.

### C. Kinetic Typography (Staggered Text)

**Goal**: Instead of a boring fade-in, we want the letters "R-A-P-L-O-A-R-D" to slam in one by one.

**Logic**:
We treat the Container (`containerVariants`) as the conductor and the Letters (`letterVariants`) as the orchestra.

- **`staggerChildren: 0.1`**: Tells the container, "Wait 0.1 seconds between starting each child's animation."
- **`transition: { ease: [0.16, 1, 0.3, 1] }`**: This is a custom "Bezier Curve". It starts fast (explosive) and ends very slowly (soft landing). It feels very "Apple-like" or "Hollywood".

### D. The "Breathing" Trend Ticker

**Goal**: Ensure the page isn't static even if the user stops moving their mouse.

**Logic**:
We animate the Y-position in an infinite loop: `y: [0, -10, 0]`.

- It moves Up 10px, then Down 10px.
- **`repeat: Infinity`**: Never stops.
- **`duration: 4`**: Takes 4 seconds for a full breath for a calm, non-distracting effect.

---

## 5. Deployment & Maintenance 🚀

1.  **Vercel**: The site is live-deployed via Vercel, connected to your GitHub.
2.  **Environment Variables**: The site depends on a `.env` file containing Firebase keys. This file is **not** on GitHub. If you clone the repo to a new machine, you must recreate this file.
3.  **Scroll To Top**: Added a global listener in `App.tsx` that mounts the `ScrollToTop` component. It only appears after scrolling down 300px.

---

**Built with 🖤 by your Lead Architect / Vibe Coding Team.**
