# veyra-cli

Scaffold Stellar agent projects — including one that charges for itself.

```bash
npm install -g veyra-cli
```

## Charge for your API in five minutes

```bash
veyra create x402 --name my-paid-api
cd my-paid-api && npm install
```

Fill two values in the generated `.env`:

| Variable | Where it comes from |
|---|---|
| `STELLAR_PAY_TO` | the Stellar account that receives payments (`G...`) |
| `X402_FACILITATOR_API_KEY` | free at [channels.openzeppelin.com/gen](https://channels.openzeppelin.com/gen) |

The API key is not optional. The facilitator rejects unauthenticated servers
on testnet as well as mainnet, so without it your routes never get as far as
offering a 402.

```bash
npm run dev
```

Everything under `/premium` now bills before it answers. A caller without
payment gets a 402 carrying the terms; one that pays gets the data, and the
transfer settles on Stellar before your handler returns. No subscription, no
card, no invoice, no human in the middle.

The generated server is about ten lines, because `x402Serve()` from the
[`veyra`](https://www.npmjs.com/package/veyra) SDK carries the facilitator
client, the scheme registration and the route shape.

**Usage telemetry (disclosed, not hidden):** once running, `x402Serve()`
sends Veyra a small, non-blocking usage ping — a SHA-256 hash of your
`X402_FACILITATOR_API_KEY` (never the key itself), your `STELLAR_PAY_TO`
address, network, route/request counts, and the SDK version, timestamped
server-side. It never blocks, delays, or fails a charge if the ping fails.
This is the only way Veyra knows whether a scaffolded server like this one
is actually running in production — it doesn't authorize or gate anything.
Set `VEYRA_X402SERVE_TELEMETRY=false` in the generated `.env` to opt out.

## Listen to protocol signals

```bash
veyra create bot --name my-agent          # TypeScript
veyra create bot --name my-agent -t py    # Python
```

Scaffolds a project that connects to a Veyra agent and prints incoming
signals, which the autonomous loop produces on testnet. Defaults to `https://veyra-agent.fly.dev` (testnet); set
`VEYRA_API_URL` and `VEYRA_API_KEY` in `.env` to point somewhere else.

## Pay an x402 endpoint from the terminal

```bash
veyra pay https://your-api.example.com/premium/signals --secret S...
```

Signs and settles a real x402 payment against any endpoint that returns a
402, then prints the response. No scaffolding involved — this hits a live
server directly, useful for testing a `veyra serve` instance or someone
else's paid API without writing a client.

| Option | Purpose |
|---|---|
| `-s, --secret <secret>` | Stellar secret key (`S...`) that pays. Also read from `VEYRA_SECRET_KEY` or `veyra config set secretKey S...`, in that order. |
| `-n, --network <network>` | `stellar:testnet` (default) or `stellar:pubnet` |
| `-a, --amount <amount>` | Override the price the server advertises |
| `--json` | Machine-readable result: status, duration, payer, tx hash, response body |

The secret key never leaves your machine except as a signature — the CLI
signs locally and sends the signed payment, not the key itself. Missing a
secret key fails immediately with the three ways to supply one, before any
network call happens.

## Spin up a local x402 test server

```bash
veyra serve --pay-to G... --api-key <facilitator-key>
```

A one-command x402 server for testing `veyra pay` (or any x402 client)
against, without scaffolding a whole project. Same facilitator requirement
as `create x402`: get a free key at
[channels.openzeppelin.com/gen](https://channels.openzeppelin.com/gen).

| Option | Values | Default |
|---|---|---|
| `-P, --pay-to <address>` | Stellar `G...` address that receives payments | required |
| `-k, --api-key <key>` | facilitator API key | required |
| `-p, --price <price>` | e.g. `$0.02` | `$0.02` |
| `-port, --port <port>` | | `3000` |
| `-r, --route <route>` | path to protect | `/api/v1/data` |
| `-n, --network <network>` | `stellar:testnet` or `stellar:pubnet` | `stellar:testnet` |

`--pay-to` and `--api-key` can also come from `veyra config set` instead
of being passed every time.

## Check an agent

```bash
veyra status
```

## Diagnose your x402/MPP setup

```bash
veyra doctor --network testnet
```

Five checks against your actual environment before you find out the hard
way in production: `payTo` is a well-formed public key (not a secret key
pasted in the wrong field — a real mistake this catches), the facilitator
API key authenticates against `channels.openzeppelin.com`, the Soroban RPC
endpoint for your target network is reachable, `STELLAR_SECRET_KEY` (if
set) is validly formatted, and MPP config (if set) is internally
consistent. Reads from `.env` in the current directory by default.

| Option | Purpose |
|---|---|
| `-n, --network <network>` | `testnet` (default) or `pubnet` |
| `-c, --config <path>` | custom `.env`/config path |
| `--json` | machine-readable report for CI |

Exits non-zero if any check fails, so it's usable as a CI gate ahead of a
deploy.

## Verify an audit record

```bash
veyra verify <cid>
```

Independently re-checks a Veyra audit document anchored to IPFS: fetches
it from a gateway, recomputes its SHA-256 content hash, and — if the
document carries an agent attestation — verifies the ed25519 signature
over `veyra-audit-v1:<content_sha256>` against the declared signer's
Stellar public key. Nothing here trusts the document's own claims about
itself; both the hash and the signed statement are recomputed from the
raw content, not read off the document.

| Option | Purpose |
|---|---|
| `-g, --gateway <url>` | IPFS gateway to fetch from | `https://gateway.pinata.cloud` |
| `--json` | machine-readable result |

Exits non-zero (and prints which check failed) if the hash doesn't match
or the signature doesn't verify.

## Manage stored credentials

```bash
veyra config set secretKey S...
veyra config list
veyra config get payTo
veyra config delete facilitatorApiKey
```

Stores `secretKey`, `payTo`, `network`, and `facilitatorApiKey` in
`~/.veyrarc.json` (mode `600`) so `pay`, `serve`, and `doctor` don't need
them repeated on every invocation — command-line flags and environment
variables still take priority when present. `list` and `get` mask secret
values in their output; the raw file is never printed.

## Options

| Option | Values | Default |
|---|---|---|
| `-n, --name <name>` | project directory name | `veyra-bot-v1` |
| `-t, --template <template>` | `ts` or `py` — `bot` only | `ts` |

## Links

- [veyra.xyz](https://veyra.xyz)
- [TypeScript SDK](https://www.npmjs.com/package/veyra) · [Python SDK](https://pypi.org/project/veyra/)
- [Source and examples on GitHub](https://github.com/veyra-protocol/veyra)

## License

Apache 2.0 — Veyra Protocol
