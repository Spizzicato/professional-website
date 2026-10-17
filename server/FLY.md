# Deploy room server to Fly.io

The Next.js site and the Yjs relay are separate processes. This guide is only
for `server/roomServer.mjs`.

The Fly Docker image installs from `server/package.json` (relay deps only), not
the root Next.js `package.json`.

## One-time setup

1. Install the [Fly CLI](https://fly.io/docs/flyctl/install/) and log in:
   `fly auth login`

2. From the **repository root**, create the app (pick a unique name if
   `graphgame-rooms` is taken):

   ```bash
   fly launch --config fly.rooms.toml --copy-config --no-deploy
   ```

   Confirm the region and that you do **not** need a Postgres/Redis add-on.

3. Deploy:

   ```bash
   fly deploy --config fly.rooms.toml
   ```

4. Note the public URL, e.g. `https://graphgame-rooms.fly.dev`.

5. Point the **Next.js build** at the relay (Vercel env or local `.env`):

   ```bash
   NEXT_PUBLIC_ROOM_SERVER_URL=wss://graphgame-rooms.fly.dev
   ```

   Use `wss://` (no path, no `:8080`). Room ids are sent as the WebSocket path
   by y-websocket (`wss://host/<roomId>`).

6. Redeploy the website so the env var is baked into the client bundle.

## Updates on push

In the [Fly dashboard](https://fly.io/dashboard), connect this GitHub repo and
set:

- **Config file:** `fly.rooms.toml`
- **Deploy only:** when this file or `server/roomServer.mjs` / `Dockerfile.rooms`
  change, or deploy the whole repo on every push to `main` (simplest).

Alternatively, add a GitHub Action that runs `fly deploy --config fly.rooms.toml`
on push to `main` (requires `FLY_API_TOKEN`).

## Useful commands

```bash
fly logs --config fly.rooms.toml
fly status --config fly.rooms.toml
curl https://graphgame-rooms.fly.dev/
```

The HTTP response `graph game rooms: N` is the health check and shows how many
room documents are in memory.

## Local vs Fly

| | Local | Fly |
|---|--------|-----|
| Start | `npm run rooms` | `fly deploy --config fly.rooms.toml` |
| Port | `1234` (`ROOM_SERVER_PORT`) | `8080` (`PORT`, set by Fly) |
| Client URL | default `ws://hostname:1234` | `NEXT_PUBLIC_ROOM_SERVER_URL=wss://…` |
