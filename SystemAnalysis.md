# MuayLang — System Analysis (System Analyst)

> **Document type**: System Analysis / Functional Specification (SA as System Analyst)  
> **Audience**: PM / Dev / QA / Stakeholders  
> **Scope**: Current repo behavior + agreed rules (as implemented)  
> **Last updated**: 2026-03-18

---

## 1) Background & Problem Statement

MuayLang is a cross-platform app (iOS/Android/Web) for:
- Learning Thai vocabulary (daily sets, personal vocab list, quizzes)
- Logging Muay Thai training sessions (metrics + photos + charts)

Primary constraints from production usage:
- iOS Safari session instability (can fall back to guest/unauthorized)
- Cross-device data freshness (web tab can show stale cached data)

---

## 2) Objectives (What success looks like)

- Users can **register/login** and stay logged in reliably on mobile + web.
- Users can **browse daily vocabulary** by date and take quizzes.
- Users can **create/edit training sessions**, upload photos, and review charts.
- Guest mode works as **view-only** demo access without write permissions.
- Web data is reasonably fresh across devices/tabs (no “why can’t I see today’s entry?”).

---

## 3) In Scope / Out of Scope

### In scope
- Auth flows: register/login/logout/email verification/guest mode
- Learning:
  - Personal vocabulary list CRUD + favorites/tags (where available)
  - Daily vocabulary lookup by date
  - Quiz flows:
    - Review quiz (max 5 questions) with translations reveal behavior
    - Daily quiz (10 questions, per selected date, non-AI)
- Training:
  - Training CRUD
  - Photo upload + preview + full view
  - Overview stats + chart zoom
  - Weekly “This Week” definition = week starts Monday
- Discovery:
  - Daily discovery item display
  - Import script upsert + image sync

### Out of scope (for this document)
- Full offline-first sync
- Realtime subscriptions
- Payments/monetization
- Admin CMS UI

---

## 4) Stakeholders & Personas

### Stakeholders
- **Learner**: wants consistent daily practice + quiz feedback
- **Trainee**: wants to log sessions quickly + view progress charts
- **Maintainer**: wants stable web auth, clear data model, safe guest mode

### Personas
- **P1: Guest** (no login): browse demo data only
- **P2: Logged-in user**: full access to CRUD + quiz + charts
- **P3: Web user on iOS Safari**: most sensitive to session/caching issues

---

## 5) Assumptions & Dependencies

- Backend services are Appwrite (Auth/DB/Storage).
- Guest mode is implemented as a local flag + demo user id to view demo content.
- Wikipedia and Gemini API are optional external dependencies (Gemini used for one quiz mode; daily quiz avoids AI).

---

## 6) Core User Journeys (Use Cases)

### UC-A1: Continue as Guest
**Primary actor**: Guest  
**Goal**: View demo content without logging in.

**Preconditions**
- User not logged in.

**Main flow**
1. User taps “Continue as Guest”.
2. App sets guest mode flag.
3. App routes user to main tabs.

**Postconditions**
- `user.isGuest === true`
- Write actions are blocked (read-only guard).

**Acceptance criteria**
- Guest can navigate Learning/Training pages without crash.
- Guest cannot create/update/delete training/vocab.

---

### UC-A2: Login (Email/Password)
**Primary actor**: User  
**Goal**: Authenticated session for full access.

**Main flow**
1. User enters email/password and submits.
2. App creates Appwrite session.
3. App fetches `account.get()` and stores user state.
4. App routes to main tabs.

**Exceptions**
- Invalid credentials → show error, remain on login.
- Session blocked/expired → treat as logged out, route to auth.

**Acceptance criteria**
- After login, Training add/edit is enabled.
- On iOS Safari, session survives typical tab reloads better than cookie-only behavior.

---

### UC-T1: Add Training Session (with photos)
**Primary actor**: Logged-in user  
**Goal**: Save a training session with metrics and optional photos.

**Preconditions**
- User is not guest.

**Main flow**
1. User taps “add” in Training tab.
2. User fills required fields and optional fields (photos, HR).
3. If photos selected:
   - Upload each new local URI to Storage → returns `fileId`.
   - Save training document with `photos: [fileId...]`.
4. Navigate back; list shows new session sorted by date.

**Validation rules (UI-level)**
- Date, calories, duration, note, maxHR, avgHR required.
- AvgHR cannot exceed MaxHR.

**Acceptance criteria**
- Newly created record appears in Training list and Home “Recent Sessions”.
- Photo thumbnails render; full image view works.

---

### UC-T2: View Training Overview Charts (zoom)
**Primary actor**: User  
**Goal**: See chart and zoom without axis labels being clipped.

**Main flow**
1. User opens Training page and sees Overview chart.
2. User taps chart → opens modal with zoomed chart.
3. X/Y labels remain visible (no clipping).

**Acceptance criteria**
- After zoom, axis labels remain readable on both sides.

---

### UC-L1: Daily Vocabulary by Date + Daily Quiz (non-AI)
**Primary actor**: User  
**Goal**: Select a date (e.g. 0301/0109) and take a 10-question quiz for that day.

**Main flow**
1. User selects/searches a date in Daily Vocabulary.
2. User taps “Daily Quiz”.
3. System loads daily words for that date.
4. System generates **10 questions** locally (no AI calls).
5. User answers; summary displayed at end.

**Question types (as implemented)**
- Type B: Thai word → options contain English + Taiwanese Hanzi mapping.
- Type A: Thai example sentence cloze → options are Thai words.

**Acceptance criteria**
- Daily quiz uses selected date, not “today only”.
- No Gemini requests are made for daily quiz.

---

### UC-L2: Review Quiz (AI-assisted) — max 5 questions
**Primary actor**: User  
**Goal**: Take a review quiz with feedback + translations.

**Main flow**
1. User navigates to review quiz.
2. System builds a question pool with **max 5** items.
3. Each question shows options A–D.
4. On correct answer:
   - Show green explanation.
   - Reveal translations for **all options** (small text, purple; correct option green).
5. Summary shows question/answer plus extra translations.

**Acceptance criteria**
- Total questions displayed as 5 max.
- After correct answer, all options show translation line with required ordering:
  - `EN: ... | 台語漢字: ...｜台羅: ...`
- Summary includes EN + Taiwanese Hanzi for question/answer where available.

---

## 7) Business Rules

### BR-1 Guest mode
- Guest is **view-only**. Any add/edit/delete in training/vocab is blocked.

### BR-2 Weekly training stats
- “This Week” means **from Monday 00:00 local time** to now (not last 7 days).

### BR-3 Training list ordering
- Training sessions list is sorted by **date descending** (latest first) at the data source level.

### BR-4 Image preview compatibility
- Thumbnail preview should work on native + web; full view should always be accessible via view URL.

### BR-5 Web freshness
- Web should refetch key user-owned data on mount/focus to reflect cross-device changes.

---

## 8) Data Requirements (Logical)

### Training session fields
- `date` (ISO string)
- `calories` (number)
- `duration` (number)
- `note` (string)
- `photos` (array of storage file ids)
- `maxHeartRate`, `avgHeartRate`
- `$id`, `userId`

### Daily vocabulary fields
- `th`, `roman`
- `word` (EN meaning)
- `tw_h` (Taiwanese Hanzi), `tw_r` (romanization)
- `ex_th`, `ex_en`, `ex_tw`

### Discovery fields
- `title`, `content`, `link`, `wikiSlug`, `imageUrl`
- `$id` = `MMDD`

---

## 9) Non-Functional Requirements (Testable)

### Performance
- Training list and photos should load without blocking UI.
- Web should avoid showing stale user data after returning to tab (refetch on focus).

### Reliability (iOS Safari)
- Unauthorized should not leave app in a broken state; route back to auth or guest.

### Security
- Guest should not be able to write demo user’s data.
- No secrets committed to repo.

---

## 10) Error Handling & Edge Cases

- Session expires mid-session (Safari): app should redirect to auth (unless guest).
- Daily vocabulary date has no data: show empty state and disable quiz actions.
- Training session has invalid/missing date: sort should place it at bottom.
- Wikipedia image missing: Discovery should still show title/content/link.

---

## 11) Acceptance Criteria Checklist (QA)

### Auth
- [ ] Guest button works; no console `loginAsGuest is not a function`.
- [ ] Login works on iOS Safari; if session drops, app recovers (auth redirect).

### Training
- [ ] Add training (with photos) shows in list and Home recent list.
- [ ] Photo thumbnails show; full screen shows the image.
- [ ] Chart zoom does not clip X/Y labels.
- [ ] This Week resets on Monday.

### Learning
- [ ] Review quiz is max 5 questions.
- [ ] Correct answer reveals option translations in required order.
- [ ] Summary includes EN + Taiwanese Hanzi lines.
- [ ] Daily quiz uses selected date and generates 10 questions without AI.

### Discovery
- [ ] Import script syncs existing documents (upsert) and updates missing images when available.

---

## 12) Open Questions (Optional)

- Should guest mode read data via demo user id only, or via public read permissions?
- Should daily quiz question composition be fixed ratio or adaptive to number of words?
- Should web hydration cache be replaced with React Query persistence to reduce duplication?

