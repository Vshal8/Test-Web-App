# Companies

A small Next.js app for browsing and editing companies. The API is implemented in this app with route handlers and an in-memory store. There is no separate backend.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any non-empty token. That token is sent as `Authorization: Bearer …` on every request.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Every API handler waits 300–800ms on purpose, so loading states stay visible.

## What it does

- `GET /api/v1/companies` supports `limit`, `offset`, `q` (name and domain), `status`, and `sort` (`name`, `-name`, `created_at`, `-created_at`). The default sort is `-created_at` and the default page size is 20.
- `GET`, `POST`, and `PATCH` follow the brief: `201` with `version: 1` on create, `422` when the name is empty, `409` when `if_version` does not match, `404` when the id is missing, and `401` without a non-empty bearer token.
- `/companies` keeps search, status, sort, page, and the open company in the query string. `company=new` opens create. A shared `?company=<id>` link opens that drawer.
- Saving an edit sends the version the form was opened with. On `409`, the typed values stay put. Reload fetches the latest company and updates only that version, then you can save again.

## Decisions

The store is a seeded array of 40 companies on `globalThis`, read by the Node.js route handlers. Cache Components are off, and responses send `Cache-Control: no-store`. A cached GET would freeze the seed at build time and ignore later writes. The store still lives in one process: a restart clears edits, and more than one server instance would not share them.

Create and update rules live in one validator used by the route handlers and the form, so the client checks do not drift from the API. Known API field messages are translated; anything else is shown as the API sent it.

Server state goes through a small typed client and TanStack Query. List queries use `placeholderData: keepPreviousData`, and the table stays mounted while a new filter request is in flight. Nothing loads data with `useEffect` and `fetch`. Effects are only there for the dialog, the URL debounce, the auth redirect, and the document language.

Search is written to the URL with `replace` after 300ms. Status, sort, page, and opening or closing the drawer use `push`, so Back and Forward move through those states without an entry per keystroke.

The drawer is a native `<dialog>` opened with `showModal()`. That gives a focus trap and Escape without a component library. The form is keyed by company id, not by version, and the version it will send is React state set when that form mounts. Reload replaces the version and leaves the fields alone.

Auth is whatever non-empty string you type. It is stored in `localStorage` and attached by the client. A `401` clears it. The companies screen then sends you to `/sign-in`, keeping the current query as `next`. Labels are a hand-written English/Dutch dictionary. Dates use `Intl` with `en-GB` or `nl-NL`.

Tests use Vitest and Testing Library. The screen and form tests mock the client so they do not wait on the artificial delay. The query-key test checks that list params are part of the key and that previous list data is kept.

## With more time

I would put the companies in a database and stop depending on process memory. On a `409` I would show the server's current name, domain, and status beside the draft, not only the new version. I would add a Playwright pass for the focus trap, the back button, and the real route handlers, with the delay disabled in that environment. I would also replace the client auth gate with a session cookie so a request can be rejected before the page renders.

## Left out

- Persistence, delete, and sharing writes across multiple server processes.
- Real authentication, token expiry, and authorization beyond a non-empty bearer token.
- Domain format checks. An empty domain is stored as `null`. Any other string is accepted.
- Optimistic updates, editable page size, and a full data grid with arrow-key navigation. Rows are focusable and open with Enter or Space.
- An i18n library, translated API prose beyond the known field errors, and end-to-end browser tests.
- Visual design beyond a usable layout.
- The create link uses the query value `new`, so a company whose id was literally `new` could not be opened. Created ids are UUIDs and the seed uses `c01`…`c40`.
