# MuayLang — Solution Architecture (SA)

> **Document type**: SA (Solution Architecture / System Analysis)  
> **Scope**: Current repo implementation + recommended adjustments  
> **Platforms**: iOS / Android / Web (including iOS Safari)  
> **Backend**: Appwrite (Auth / Database / Storage)  
> **Last updated**: 2026-03-18

---

## 1) Goals & Non-Goals

### Goals
- Provide a **single codebase** for iOS/Android/Web using Expo.
- Support **Thai learning** (vocabularies, daily vocabulary, quizzes) and **Muay Thai training logs** (sessions, photos, charts).
- Ensure **guest mode** provides safe read-only demo access.
- Ensure **web caching + session stability**, especially on iOS Safari.

### Non-Goals (current)
- Full offline-first synchronization (only partial cache hydration).
- Real-time subscriptions (planned but not implemented).
- Complex role-based access control beyond Appwrite collection permissions + app-side guards.

---

## 2) Key Requirements

### Functional Requirements (FR)
- **Auth**
  - Register / Login (email+password)
  - Email verification
  - Guest mode (demo data view-only)
- **Learning**
  - Vocabulary CRUD, tags, favorites
  - Daily vocabulary browse by date
  - Review quiz (AI-assisted) and Daily quiz (non-AI, per date)
- **Training**
  - Training session CRUD
  - Photo upload to storage bucket, preview + full view
  - Overview stats + charts, chart zoom modal
- **Discovery**
  - Daily discovery content (title/content/link/imageUrl) keyed by date
  - Import script to sync/update items from CSV + Wikipedia images

### Non-Functional Requirements (NFR)
- **Security**: correct Appwrite permissions; guest is read-only.
- **Reliability**: avoid “guest scopes missing account” loops; recover gracefully.
- **Performance**: avoid unnecessary refetch on native; keep web fresh enough for cross-device edits.
- **Compatibility**: iOS Safari session behavior; image preview formats; web date inputs.

---

## 3) System Context

```mermaid
graph TB
  subgraph Client[Client]
    RN[Expo / React Native App]
    WEB[Expo Web (iOS Safari, Desktop)]
  end

  subgraph Backend[Backend]
    AW[Appwrite Cloud / Self-hosted]
    DB[(Database)]
    ST[(Storage Buckets)]
  end

  subgraph External[External]
    WIKI[Wikipedia API/Pages]
    GEM[Gemini API (quiz generation)]
  end

  RN --> AW
  WEB --> AW
  AW --> DB
  AW --> ST

  WIKI -->|import scripts| AW
  GEM -->|quiz prompt| WEB
  GEM -->|quiz prompt| RN
```

---

## 4) High-Level Architecture (Containers / Layers)

### Repository structure (logical)
- **Presentation**: `app/` (Expo Router), `components/`
- **State**
  - **Client state**: `contexts/UserContext.tsx` (auth + guest mode)
  - **Server state**: TanStack React Query (QueryClient in `app/_layout.tsx`)
- **Business/API layer**
  - Hooks: `hooks/*`
  - React Query wrappers: `lib/*API.ts`
  - Appwrite SDK wrappers: `lib/*Appwrite.js`
- **Storage**
  - React Query in-memory cache
  - Persistent cache: `lib/cacheStorage.ts` (web localStorage / native AsyncStorage)
  - Session/JWT storage: `utils/jwtStorage.ts` (plus session storage)

---

## 5) Auth & Session Architecture

### Current approach (as implemented)
- Uses Appwrite **email/password session**.
- **Guest mode** is a local flag (`guestStorage`) and a demo user id (`EXPO_PUBLIC_DEMO_USER_ID`) for viewing demo content.
- Web stability measures:
  - Appwrite endpoint forced to same-site API domain (`api.muaylang.app`) to reduce iOS Safari issues.
  - Global unauthorized event bus (`lib/authEvents.ts`) + listeners in `UserContext`.
  - Session persistence via `client.setSession(sessionId)` restored from local storage.
  - Session keep-alive via `account.updateSession('current')` (periodic + on foreground).

### Key risks & mitigations
- **iOS Safari ITP** may drop cookies/storage; session restoration + keep-alive reduce impact.
- **Unauthorized storm**: guarded with a ref flag to avoid repeated redirects/logouts.

---

## 6) Data & Caching Strategy

### Layers of caching
1) **React Query** cache: primary server-state cache.
2) **Persistent hydration cache** (`lib/cacheStorage.ts`):
   - Web: `localStorage`
   - Native: `AsyncStorage`
   - Used by `useTraining()` and `useVocabularies()` to hydrate first render.

### Web vs Native freshness policy
- **Native**: prefer stability + low traffic (`staleTime: Infinity`, minimal refetch).
- **Web**: prefer freshness across devices/tabs (`staleTime: 0`, refetch on mount/focus for key queries).

This policy is applied to:
- Training: `lib/trainingAPI.ts`
- Learning: `lib/learningAPI.ts`, `lib/dailyVocabularyAPI.ts`

---

## 7) Domain Modules

### 7.1 Training
- **Collection**: training documents in Appwrite DB (queried via `lib/traningAppwrite.js`)
- **Photos**:
  - Upload: `utils/photos.ts` → `storage.createFile(bucketId, fileId, fileData, permissions)`
  - Preview vs view URLs:
    - Preview for lists (`Session`, `PhotoUploader`)
    - View for full-screen (`BigImageModal`)
- **Charts**:
  - Overview chart + zoom modal use `react-native-chart-kit`
  - Label offsets added to prevent axis labels being clipped when zoomed

### 7.2 Learning
- **Vocabularies**: CRUD via `lib/learningAPI.ts` + `lib/learningAppwrite.js`
- **Daily vocabulary**: `lib/dailyVocabularyAPI.ts`
- **Quizzes**
  - Review quiz: AI-assisted generation (`hooks/useGetQuizQuestion.ts`) + flow (`hooks/useQuizFlow.ts`)
  - Daily quiz (non-AI, per date): local generator + flow (`hooks/useDailyVocabularyQuizFlow.ts`, `app/vocabulary/dailyReview.tsx`)

### 7.3 Discovery
- **Collection**: `discovery` keyed by `MMDD`
- Import sync:
  - Script `scripts/import_discovery.js` fetches Wikipedia images and upserts documents
  - Upsert policy: always update content/link/wikiSlug; update imageUrl only when a new image was fetched

---

## 8) Permissions & Security Model (Appwrite)

### Guest mode
- Guest must be **read-only**.
- Recommended permissions per collection:
  - **Read**: `Role.any()` (or authenticated users if desired)
  - **Write**: `Role.user(<ownerId>)` only

### Secrets & config
- `.env` is ignored; use `EXPO_PUBLIC_*` variables for client config (no secrets).
- Any server API keys must never ship to client (scripts should use server keys only).

---

## 9) Failure Modes & Handling

### Common failure modes
- **Unauthorized / missing account scopes** (Safari session drops)
  - Global unauthorized event triggers logout/redirect (unless guest mode)
- **Stale UI on web** (cross-device changes not reflected)
  - Web refetch policy on mount/focus for key queries
- **Media compatibility**
  - Use safe preview output types; provide view URLs for full-size

---

## 10) Operational Notes / Runbooks

### When users report “Web shows old data”
- Confirm web query has refetch policy enabled.
- Ask user to focus/refresh the tab (should trigger refetch).
- Verify userId consistency (guest vs authenticated).

### When users report “Safari becomes guest”
- Verify endpoint is same-site (`api.muaylang.app`).
- Confirm session restoration + keep-alive is enabled.
- Inspect Appwrite platform settings (allowed origins, domain configuration).

---

## 11) Roadmap (Recommended Improvements)
- Consolidate duplicated chart label formatting into a shared utility.
- Replace per-hook hydration with React Query persistence (single consistent persistence layer).
- Add centralized logging/telemetry for auth + storage failures (especially Safari).
- Add deterministic quiz generation from daily content with improved distractor selection rules.

