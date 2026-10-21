# Deployments

> A "deployment" is a running strategy instance: the platform's executor
> rebalances the user's connected exchange account on a schedule (UTC 0:00)
> according to the strategy's target portfolio. All commands read-only.

## `deployments`

List the user's deployments.

```
$ openalpha deployments
id             name                    status     exchange   demo    strategy
dep_abc123     磐石-防御档             running    okx        false   panshi_defensive
```

- `status` values include `running` / `stopped` (exact set may grow — with
  unexpected values prefer `--json`).
- A `stopped` deployment is not necessarily a problem; report, don't alarm.

## `deployment <id>`

Full JSON detail of one deployment (config, status, event log). JSON is the
contract here — parse it, pick the fields relevant to the user's question
(status, events timeline, strategy config), and summarize in prose.

```
$ openalpha deployment dep_abc123 --json
```

Useful checks when the user asks "is everything OK":
1. status is `running`
2. the events log shows normal rebalance entries, not repeated errors
3. cross-check `positions --live` to see the deployment's symbols actually held

## Boundary

Starting/stopping/redeploying is **not possible via this skill** (server-side
read-only enforcement). If the user asks for it: confirm you understood,
then point them to OpenAlpha web → 部署 page. Do not retry against the API.
