---
name: Testing setup & pitfalls
description: How automated tests are wired in this monorepo and quirks hit while adding them
---

- Both `@workspace/api-server` and `@workspace/dataverse` have vitest (`pnpm --filter <pkg> run test`). API tests use supertest against the Express `app`; they run on the real dev DB with snapshot/restore of the favourites table.
- **Why:** no isolated test DB exists yet (see project task about isolating test data).
- React-query cache updates are batched asynchronously — in UI tests, never assert optimistic state synchronously after `fireEvent.click`; use `waitFor` and re-query DOM nodes (rows re-render/re-sort, so held element refs go stale). Delay failing fetch stubs slightly or the optimistic state flashes before `waitFor` samples it.
- After tasks merge into the working tree, run `pnpm install` and `pnpm --filter @workspace/db run push` — merged tasks may add deps/schema the local env lacks, breaking typecheck and runtime ("relation does not exist").
- UI test fetch stubs must handle `/api/auth/user` returning `{ user: {...} }` (not the bare user), or auth-gated features silently no-op (clicks redirect to login). Also seed the page's tour-done localStorage key so the guided-tour overlay doesn't swallow clicks.
- Frontend vitest pulls `lib/*` source files into the app's transform; module resolution (e.g. `react` from a lib) can fail there even when typecheck and the running app are fine — treat such failures as test-env wiring, not app bugs.
- Optimistic favourites rollback must restore the pre-mutation cache snapshot locally (not just invalidate) so state recovers even when the server is fully unreachable.
