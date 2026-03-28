# 🎵 Project Overview — Raploard Official Web

> **Version:** 1.2 | **Last Updated:** April 2026  
> **Repository:** `VictorChidex1/raploard-web`  
> **Live URL:** [https://raploard-web.vercel.app](https://raploard-web.vercel.app)

---

## 🎯 Why We Are Building This

**Raploard** (Emmanuel Oluwafemi Olafisoye) is an emerging Afrobeats artist with a premium, high-energy brand identity anchored in the phrase _"The New Wave of Afrobeats."_

Every major artist at the global level — from Burna Boy to Drake — has a dedicated digital home that serves as the definitive point of reference for their art, brand, and movements. This web application is that definitive home for Raploard.

The goal is not simply to build a website. The goal is to build a **digital luxury asset** — a platform so visually powerful and functionally solid that it elevates Raploard's brand perception to the level of a global act. When a fan, journalist, booking agent, or label A&R visits this site, they should feel the weight and quality of the brand within seconds.

**The design philosophy is: Dark. Luxury. Cinematic. Expensive.**

---

## 🏗️ What We Have Built

### 1. 🏠 Home Page

The main landing experience. A powerful, multi-section page designed to capture and hold attention.

- **Hero Section:** Full-screen cinematic hero with a large, bold headline and a subtle background image (Raploard's photo). Includes a primary CTA.
- **Sonic Vault (Audio Player):** A custom-built, premium audio player embedded below the Hero. Fans can stream Raploard's music directly from the website without being redirected to a third-party platform.
- **Tour Dates Section:** Displays upcoming tour dates. If no dates are available, an elegant "RSVP" empty-state prompts fans to sign up.
  - **RSVP Modal:** A Firebase-connected modal where fans can submit their name, email, and city of interest to be notified about upcoming shows. All submissions are stored in Firestore.
- **"Sonic Manifesto" (About Section):** A high-fashion, editorial-style section presenting Raploard's brand story and artistic identity.

### 2. 🎵 Music Page

A dedicated space for Raploard's discography.

- Showcases albums, singles, and EPs.
- Links directly to streaming platforms (Spotify, Apple Music, etc.).

### 3. 🎬 Videos Page

A curated video gallery featuring official music videos and visual content.

- Embedded YouTube player integrated directly into the page experience.

### 4. 🛍️ Store Page

The official merchandise hub.

- Displays available Raploard merch with clear product cards.

### 5. 📖 About Page

A full-page deep-dive into Raploard's artistic world.

- Expanded biography, brand ethos, and the artist's story.

### 6. 📩 Contact Page

A direct communication channel for business inquiries.

- **Firebase-connected contact form** for booking requests, press, and brand collaborations.
- All submissions stored securely in Firestore.

### 🌍 Tour Page ("The Live Circuit")

A dedicated, immersive tour experience designed to feel like a premium digital tour book.

- **"Live Atlas" Visuals:** Cinematic, high-contrast nightscapes of tour cities (London, Lagos, NYC) that shift as the user scrolls.
- **Luxury Ticket Layout:** Each tour date is styled as a digital concert ticket with high-end typography and custom CSS details.
- **Impact Zone Map:** A dark, minimal world map with gold pins representing the global movement.
- **"Golden Circle" VIP Portal:** A high-end RSVP section at the bottom for priority access to future tour expansions.

### 🛡️ Privacy Policy Page ("The Vault")

A high-end, luxury-designed legal document — far beyond a standard policy wall of text.

- **Desktop:** Split-view layout with a sticky, frosted-glass "The Index" sidebar for easy navigation, plus a "Print" action.
- **Mobile:** Gold-accented dark accordion for elegant readability.
- **Features:** Live reading progress bar (gold), TL;DR Executive Summary, Playfair Display editorial typography, staggered scroll animations, and a dedicated CCPA/GDPR section.

### 8. 📜 Terms of Service Page ("The Accord")

The legal counterpart to the Privacy Policy, maintaining the same premium aesthetic.

- **Desktop:** Sticky "The Codex" glass sidebar with a "Print Official Copy" button.
- **Mobile:** Dark gold accordion.
- **Features:** Large background section numbers (Digital Ledger style), live reading progress bar, Playfair Display pull-quotes, and staggered scroll animations.

---

## ⚙️ Technical Foundation

| Area           | Stack                                                      |
| -------------- | ---------------------------------------------------------- |
| **Framework**  | React 18 + Vite                                            |
| **Language**   | TypeScript (strict)                                        |
| **Styling**    | Tailwind CSS + Custom Brand Tokens                         |
| **Animation**  | Framer Motion                                              |
| **Icons**      | Lucide React                                               |
| **Database**   | Firebase Firestore                                         |
| **Auth**       | Firebase Authentication (configured, ready for use)        |
| **Deployment** | Vercel (CI/CD from `main` branch)                          |
| **PWA**        | `vite-plugin-pwa` — Standalone mode, installable on mobile |

---

## 📁 Key File Map

| File                        | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `src/config.ts`             | Single source of truth for all artist data (name, email, socials) |
| `src/App.tsx`               | All route definitions                                             |
| `src/index.css`             | Global styles, Tailwind directives, brand CSS variables           |
| `src/lib/firebase.ts`       | Firebase client initialization                                    |
| `src/components/Navbar.tsx` | Global navigation bar (with safe area support)                    |
| `src/components/Footer.tsx` | Global footer (with newsletter form connected to Firebase)        |
| `index.html`                | SEO meta, Google Fonts, PWA meta tags                             |
| `tailwind.config.js`        | Brand color tokens and font families                              |
| `vite.config.ts`            | PWA manifest configuration                                        |

---

## 🌐 Brand Identity Summary

| Property          | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| **Artist**        | Raploard                                               |
| **Real Name**     | Emmanuel Oluwafemi Olafisoye                           |
| **Genre**         | Afrobeats                                              |
| **Brand Color**   | `#09090b` (Raploard Black) + `#ffd700` (Raploard Gold) |
| **Brand Feel**    | Dark, Luxury, Cinematic, Editorial                     |
| **Booking Email** | book@raploard.com                                      |
| **Instagram**     | @raploard_tm                                           |
| **Twitter/X**     | @Raploard_Tm                                           |
| **YouTube**       | @raploardOfficial                                      |

---

## 🗺️ Development Roadmap

- [x] Core Pages (Home, Music, Videos, Store, About, Contact)
- [x] Firebase Backend (Newsletter, RSVP, Contact Form)
- [x] PWA + Mobile Immersion (Full-screen, notch handling)
- [x] Privacy Policy ("The Vault")
- [x] Terms of Service ("The Accord")
- [ ] Admin Dashboard (View newsletter subscribers, RSVPs)
- [ ] SEO & Open Graph Optimization (social sharing previews)
- [ ] Blog / News Section
- [ ] Artist App (Possible React Native expansion)
