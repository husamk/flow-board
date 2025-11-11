# Flow Board

Flow Board is a lightweight collaborative task management app inspired by Trello. It supports offline usage, real-time synchronization across tabs, and persistence via Firebase Firestore.

---

## 🚀 Features

- **Offline-first:** Works seamlessly offline using localForage and syncs when online.
- **Real-time Broadcast:** Changes propagate across open tabs instantly.
- **Drag and Drop:** Organize cards and columns via smooth DnD interactions.
- **Firebase Integration:** All boards, columns, and cards sync to Firestore.
- **Role-based Sharing:** Share boards by email with `owner` or `editor` roles.
- **Optimistic UI:** Instant UI updates even before Firestore confirmation.

---

## 🧰 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **State Management:** Zustand (with persist + localforage)
- **Database:** Firebase Firestore
- **UI Library:** Shadcn UI
- **Build Tool:** Vite
- **Testing:** Vitest + React Testing Library

---

## 🧩 Project Structure

```
src/
 ├─ components/      → UI Components (Header, Modals, Columns, Cards)
 ├─ store/           → Zustand stores (boards, columns, cards, modals)
 ├─ utils/           → Broadcast, Network helpers, PendingQueue
 ├─ routes/           → Route-based views (Home, Board, SignIn)
 ├─ lib/             → Firebase configuration
```

---

## 🏃‍♂️ Run Locally

### 1️⃣ Install dependencies

```bash
yarn install
```

### 2️⃣ Start development server

```bash
yarn dev
```

App runs on [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Build for Production

```bash
yarn build
yarn preview
```

The production-ready build is served from `/dist`.

---

## 🧪 Testing

Run unit and component tests using Vitest:

```bash
yarn test
```

To run tests in watch mode:

```bash
yarn test:watch
```

---

## 🚀 Deploy

Deployment can be done using Firebase Hosting or any static host:

```bash
yarn build
firebase deploy
```

Or manually:

- Upload `/dist` to Vercel, Netlify, or any static host.
- Ensure `.env` includes your Firebase configuration keys.

---

## ⚖️ Trade-offs

| Decision                    | Trade-off                                                                 |
| --------------------------- | ------------------------------------------------------------------------- |
| **Firestore + LocalForage** | Easy offline sync but added complexity managing merge conflicts.          |
| **Zustand stores**          | Simpler and lightweight state vs Redux.                                   |
| **BroadcastChannel**        | Great for local tab sync, but not for multi-user real-time updates.       |
| **Vite**                    | Fast builds, but limited server-side rendering support.                   |
| **Optimistic UI**           | Great UX but risk of temporary UI inconsistency if Firestore write fails. |

---

## 🧑‍💻 Development Notes

- When offline, actions queue up and sync automatically once online.
- Deletions use **soft delete** (`deletedAt` field) to enable archive/restore functionality.
- `createdAt` and `updatedAt` fields are automatically populated by Firestore.
- Firestore rules should be adjusted before production to restrict open writes.
- Each board’s updates automatically bump `updatedAt` to support sorting and “Recently Updated.”

---
