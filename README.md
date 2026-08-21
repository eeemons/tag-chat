# TagChat — Modern Real-Time Chat Platform

A high-performance, responsive real-time messaging application and showcase landing page built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Redux Toolkit**, and **Socket.io**.

---

## 📚 Documentation & Specifications

- 📘 **[API Documentation (`api_documentation.md`)](./api_documentation.md)** — Complete API reference, endpoint definitions, authentication workflows, request/response schemas, and query parameters.
- 🛠️ **[Backend API Improvement Notes (`api_improvement_suggestions.md`)](./api_improvement_suggestions.md)** — In-depth analysis of backend quirks, regex search crash fixes, phone number normalization, group permissions, and production recommendations.

---

## 🚀 Key Features

### Part 1: Real-Time Chat Application (`/chat`)

- **Seamless Authentication**: Instant phone + name login with automatic registration for new users (no tedious multi-step forms).
- **Direct & Group Conversations**:
  - Search any user by phone number or name to start 1:1 direct messages.
  - Create rich group chats with multi-participant selection, customizable group names, and descriptions.
- **Bi-Directional Real-Time Messaging**: Socket.IO integration for instant message transmission, live incoming chat updates, and fallback polling resilience.
- **Smart Scroll Management**:
  - Automatically pins and scrolls to the bottom for new incoming messages.
  - Intelligently detects if the user is scrolling up to read conversation history, preventing annoying scroll jumps and displaying a floating "New Messages / Jump to Latest" badge.
- **Expressive Chat Mechanics**:
  - Automatic ASCII emoticon conversion (e.g. `:)` ➔ 😊, `<3` ➔ ❤️).
  - Integrated emoji picker popover for quick reactions and typing.
  - Timestamps with intelligent date separators (Today, Yesterday, formatted dates).
  - Empty message prevention, input trimming, and optimistic UI dispatch.
- **Group Administration & Member Management**:
  - View participant lists with online status badges.
  - Add new members, remove members, update group info, or leave groups with confirmation dialogs.
- **Personalized Chat Wallpapers**: Customizable chat themes (solid gradients, doodle patterns, minimal geometric backgrounds, or custom image URLs) persisted across sessions.

### Part 2: Showcase Landing Page (`/`)

- **Original & Engaging Visual Identity**: Custom glassmorphism, animated ambient lighting, dynamic gradients, and modern typography tailored specifically to showcase TagChat.
- **Interactive Live Preview Sandbox**: An interactive in-browser mock chat widget directly on the landing page, allowing visitors to test messaging, switch mock users, and see real-time UI reactions before logging in.
- **Feature Deep Dives**: Showcases real-time sync, privacy, group management, and cross-device responsiveness with zero generic template filler.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type-checking across API contracts and state)
- **State Management**: [@reduxjs/toolkit](https://redux-toolkit.js.org/) + `react-redux` (Normalized conversation & auth slices)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Real-Time Client**: [Socket.io Client](https://socket.io/docs/v4/client-api/)
- **Icons & Polish**: [Lucide React](https://lucide.dev/), `node-emoji`, `emoticon`, `clsx`

---

## 🏁 Getting Started & Local Development

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/eeemons/tag-chat.git
cd tag-chat

# Install dependencies using pnpm
pnpm install
```

> **Note:** Zero environment configuration is required. The API and WebSocket endpoints are already pre-configured with defaults out of the box.

### 2. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:4000](http://localhost:4000) (or [http://localhost:3000](http://localhost:3000)) in your browser.

- Visit `/` to experience the Landing Page.
- Visit `/login` or `/chat` to test the full chat client.

### 3. Production Build & Linting

```bash
# Type check and run ESLint
pnpm lint

# Build optimized production bundle
pnpm build

# Run production server
pnpm start
```

---

## 🧠 Part 3 — Thought Process Write-Up

### 1. Architecture, Libraries & Approach (Part 1)

When designing the frontend architecture for TagChat, the primary goal was to treat it as a **production-grade enterprise chat system** rather than a throwaway prototype.

#### **State Management Strategy (Redux Toolkit vs. React Query / Context)**

- **Why Redux Toolkit**: Chat applications have inherently complex bi-directional state requirements. Incoming messages arrive via WebSockets out-of-band from HTTP responses, conversation unread counts must update globally, and optimistic local message states need reconciliation when server acknowledgments arrive. Redux Toolkit provides a predictable, centralized store with slice reducers where WebSocket listeners can cleanly dispatch actions without causing component re-render cascades.
- **Trade-offs considered**: React Query (TanStack Query) is fantastic for standard REST cache invalidation, but can become cumbersome when continuous real-time socket events mutate nested conversation trees. Pure React Context frequently triggers unnecessary re-renders across the message list when typing indicators or single messages update.

#### **Real-Time Socket Architecture & Lifecycle Handling**

- A singleton socket manager (`src/lib/socket.ts`) was implemented with automated reconnection policies, authentication token injection, and active room registration (`join_conversation` / `leave_conversation`).
- To prevent duplicate messages on re-connection or rapid network handshakes, incoming messages are deduplicated against the existing Redux message array by unique `_id` and client timestamp keys.

#### **Scroll Pinning & Viewport UX**

- One of the biggest friction points in chat apps is erratic scroll behavior. We implemented a container scroll observer that calculates whether the user is within a threshold distance of the bottom (`scrollHeight - scrollTop - clientHeight < 120px`).
- If true: new incoming messages auto-scroll smoothly to the latest.
- If false (the user scrolled up to read history): auto-scroll is paused, and a floating indicator alerts them to new unread messages below, respecting their reading flow.

---

### 2. Design Choices & Product Direction (Part 2)

For the landing page, the objective was to break away from generic B2B boilerplate templates (such as stock testimonial carousels or generic FAQ accordions) and create a **product-first narrative**:

1. **Interactive Product Demo in the Hero**: Rather than showing static screenshots or mock mockups, we built a fully interactive live chat sandbox component directly on the hero. Prospective users can type messages, trigger mock replies, and test emoji conversions right away.
2. **Cohesive Visual Hierarchy**: A dark, modern theme with deep slate backgrounds, subtle radial gradients, and crisp emerald/cyan accent glows that mirror the chat UI’s native design language.
3. **Clear Functional Storytelling**: Highlights key user benefits: zero-friction registration, robust group channels, expressive emoji handling, and instant real-time synchronization.

---

### 3. AI Tooling Usage & Developer Reflection

During the development lifecycle, AI tooling was strategically integrated into the workflow using two primary models with distinct responsibilities:

- **Tools Used & Delegation Strategy**:
  - **Codex (GPT-5.6)**: Leveraged for high-rigor architectural thought processes, complex state reconciliation designs, evaluating data-flow trade-offs, and reasoning through subtle asynchronous race conditions.
  - **Antigravity (Gemini 3.7 Flash)**: Utilized for high-throughput, rapid generation tasks — scaffolding UI layouts, writing repetitive boilerplate components, drafting TypeScript interfaces from Swagger docs, and assembling initial API documentation drafts.

- **What was Changed, Rejected, or Written Manually**:
  - **Socket & State Synchronization**: AI generated simplistic socket listeners attached inside component-level `useEffect` hooks, causing memory leaks and duplicate dispatches upon route transitions. I rejected this pattern and manually architected a centralized Redux-driven socket lifecycle singleton.
  - **Smart Scrolling Logic**: Madagascar. AI-suggested scroll approaches naively called `.scrollIntoView()` unconditionally on every re-render, breaking the UX when users scrolled up to inspect message history. I replaced this with custom container viewport math that detects user reading intent and toggles auto-scroll conditionally.
  - **API Edge-Case Resilience**: AI generation failed to predict backend regex parsing crashes when queries contained `+` symbols in phone numbers. I wrote client-side query sanitization and fallback error boundaries manually to harden the application against unhandled server faults.

---

### 4. API Inconsistencies & Edge Cases Handled

During integration with the provided backend (`https://frontend-task-chatapp.onrender.com`), several quirks were identified and handled gracefully on the frontend:

1. **Special Character Crash in User Search (`+` symbol)**:
   - _Issue_: Searching for phone numbers starting with `+` caused the backend to crash with a `500 Regex error`.
   - _Frontend Handling_: Sanitized and stripped/escaped query parameters before sending search requests, ensuring smooth search UX.
2. **Phone Number Normalization**:
   - _Issue_: The backend treated different phone formats (`017...` vs `+88017...`) as separate accounts.
   - _Frontend Handling_: Added standard validation and formatting to ensure consistent phone representations.
3. **Group Management Payload Asymmetries**:
   - _Issue_: Group member updates returned heterogeneous user object structures compared to initial conversation fetches.
   - _Frontend Handling_: Implemented robust normalization adapters in `src/lib/api.ts` and Redux reducers to handle polymorphic user objects seamlessly.

> 📖 **Related Documentation**:
> - 🛠️ **Detailed Backend Analysis & Fixes**: [`api_improvement_suggestions.md`](./api_improvement_suggestions.md)
> - 📘 **Complete API Endpoint Reference & Schemas**: [`api_documentation.md`](./api_documentation.md)

---

### 5. Future Improvements With More Time

If extended with additional development time, the following enhancements would be next on the roadmap:

- **Offline Storage & Optimistic Sync**: Adding IndexedDB caching (via Dexie.js or Redux Persist) to allow reading conversations offline and queueing messages to dispatch upon reconnection.
- **Virtual Scrolling for Large Histories**: Integrating `@tanstack/react-virtual` to virtualize conversations with 10,000+ messages for 60fps rendering performance.
- **Rich Media & File Uploads**: Presigned S3/Cloudinary upload pipelines with client-side image compression and inline audio/video players.
- **End-to-End Encryption (E2EE)**: Implementing client-side Web Crypto API (Signal Protocol / Olm) for private 1:1 communications.
- **Comprehensive E2E Test Suite**: Full Playwright test coverage testing multi-user concurrent socket messaging and group management workflows.

---

## 📄 License & Attribution

Built for the Senior Frontend Engineer evaluation. All rights reserved.
