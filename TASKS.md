# Raploard Web Application - Master Task Checklist

This document serves as a physical tracker for pending technical executions and overarching project tasks.

## Pending Infrastructure Deployments
- [ ] **Activate Firebase Cloud Storage (Image Upload Pipeline)**
  * Currently blocked because new storage buckets require the Blaze (Pay-as-you-go) plan.
  * **Next Steps:**
    1. Go to Firebase Console and upgrade to Blaze.
    2. Click "Get Started" under the Storage tab to physically boot up the bucket.
    3. Run `gsutil ls` in Google Cloud Shell to get your official bucket URL (usually ending in `.appspot.com` or `.firebasestorage.app`).
    4. Run the CORS unblock command in Cloud Shell: `echo '[{"origin": ["*"],"method": ["GET", "PUT", "POST", "DELETE", "OPTIONS"],"maxAgeSeconds": 3600}]' > cors.json && gsutil cors set cors.json gs://YOUR-ACTUAL-BUCKET-URL`
    5. Run `npx firebase deploy --only storage` in your terminal to deploy the airtight security rules.

## Completed Milestones
- [x] Integrate Global Tour Interactive Map & RSVP System
- [x] Deploy Contact Form Security Anti-Spam Firebase Rules
- [x] Configure PWA SEO and Open Graph Metatags
- [x] Build The Vault (Admin Dashboard) with Spotify Manual Override
- [x] Engineer Editorial Journal CMS (Auto-Slug & Auto-Excerpt Generation)
- [x] Fix Image Landscape/Portrait Aspect Ratio Clipping
- [x] Engineer Custom Database Cursor Next/Prev Pagination for News Feed

*(Feel free to edit this file to add your own personal marketing or deployment tasks!)*
