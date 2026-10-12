# v2: Focus together

Design notes for the social feature planned after v1. Nothing here is implemented; the point is to
make sure v1's session model and storage layer do not get in the way later.

## What users want (and what to avoid)

People like focusing with friends: Forest's co-planting and Flora's rooms are the most-mentioned
social features in reviews. The complaints are about friction: multi-step room setup, accounts
required for everyone, invitations that expire, and unclear rules about what happens when one person
leaves. Grove's version should take under ten seconds to join and explain the one rule up front.

## The feature

- **A room is a 6-character code** (uppercase letters and digits without look-alikes, e.g. `K7M3PX`)
  and an equivalent link (`https://…/together/K7M3PX`). Anyone with the code can join; no account.
- **One shared plant.** The host picks species and duration; everyone sees the same seed growing.
  Each participant chooses a display name (stored locally) and a companion outfit.
- **If anyone leaves, the shared plant wilts** for everyone, after that person's grace period
  (Standard: 15 s, Deep: 5 s). Gentle rooms are allowed too: leaving only shows who is away.
- **Everyone earns their own dew and plant.** On success each participant gets the plant in their
  own garden with a small "grown together" marker and a +10% dew bonus; on a wilt everyone gets the
  honest wilted record, same as solo.
- **Rooms are ephemeral.** A room lives for one session (plus a 10-minute lobby before and a
  2-minute result screen after). Nothing social is stored long term.

## Why v1 is ready for this

- The session engine (`src/features/timer/engine.ts`) is pure and event-driven: `hide`, `show`,
  `tick`, `giveUp` and friends, all stamped with a wall-clock `now`. A room is the same engine with
  events arriving from several people. The host's `startedAt`/`endsAt` are authoritative; clients
  derive remaining time from them exactly as the solo timer does, so clock drift and throttled tabs
  are handled the same way.
- `Session` already has `mode`, `strictness` and `speciesId`; v2 adds an optional `roomId` and
  `participants` count. The IndexedDB migration list (`src/storage/db.ts`) is versioned, so this is
  one migration: add the two optional fields and an index on `roomId`.
- `Plant` gets an optional `together: true` flag for the marker in the garden.
- The storage layer is the only code that touches IndexedDB, so a sync adapter for room events
  slots in next to it without touching the UI.

## Protocol (sketch)

```
client -> server   join        { room, name, outfit }
server -> client   state       { room, host, participants[], config, startedAt?, endsAt?, status }
host   -> server   start       { speciesId, minutes, strictness }
client -> server   presence    { visible: boolean, at }        // from visibilitychange/blur
server -> all      presence    { participant, visible, graceEndsAt? }
server -> all      wilted      { by, at }  |  completed { at }
client -> server   leave
```

The server owns the clock: it stamps `startedAt`, computes `endsAt`, runs the grace timers, and is
the only thing that can declare `completed` or `wilted`. Clients send presence as they observe it.
A client that disconnects without a `leave` is treated as hidden from the moment the socket drops.

## Backend options

| Option                                       | Fit  | Notes                                                                                                                                                                                                                     |
| -------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Worker + Durable Objects**      | Best | One Durable Object per room holds state in memory, has its own alarms for grace timers, and fans out over WebSockets. Rooms are tiny and short-lived, which is exactly the DO model. Free tier covers a hobby deployment. |
| **Supabase Realtime (Presence + Broadcast)** | Good | No server code to write; Presence gives join/leave for free. The grace timer would have to run on a client (the host) or an edge function, which is weaker when the host is the one who left.                             |
| **PeerJS / WebRTC mesh**                     | Poor | No server to keep, but NAT traversal needs a signalling server anyway and a mesh cannot be authoritative about time.                                                                                                      |

Recommendation: a single Worker with one Durable Object class (`Room`), ~300 lines, deployed from
this repository under `worker/`. The PWA stays on GitHub Pages and talks to the Worker over WSS.

## Privacy

- Display names and room codes only; no accounts, no persistent identifiers.
- The server keeps room state in memory and forgets it when the room closes. No logs of who
  focused with whom.
- The feature is opt-in behind a "Focus together" entry on the timer screen; the rest of the app
  keeps working fully offline.

## UI

1. Timer screen gains a secondary action: **Focus together**.
2. Sheet: **Create room** (shows the code and a copy/share button) or **Join** (6-character input,
   auto-advancing; pasting a link also works).
3. Lobby: list of companions with names; the host picks species and length; one rule shown in
   plain words: "If anyone leaves, the plant wilts for everyone."
4. Session: the shared plant in the middle, participants' companions around it; an away participant's
   companion looks worried and shows a countdown.
5. Result: shared outcome, personal dew, "Plant another together" keeps the room open.

## Open questions

- Should Gentle rooms allow pauses, and if so who can pause? Proposal: host only, and a pause pauses
  everyone.
- Maximum room size: 8 keeps the session screen readable.
- Whether to let rooms outlive a session as "groups" with a shared garden. Not for v2.
