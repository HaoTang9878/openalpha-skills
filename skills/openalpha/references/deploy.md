# Controlled actions — `deploy stop|start` (scope: deploy)

> The only state-changing capability a key can ever have, and it is exactly
> two endpoints: stop and restart a strategy deployment. Server-enforced by
> the scope allowlist; orders/funds/config remain impossible for any key.

## Commands

```
openalpha deploy stop  <deployment-id> --confirm   # 停止(杀执行器进程+状态置 stopped)
openalpha deploy start <deployment-id> --confirm   # 重启(复用库内配置拉起执行器)
```

`--confirm` is REQUIRED — the CLI hard-refuses without it (exit 1). `start`
maps to the platform's `restart` endpoint (config is reused from the store).

## Two-message confirmation protocol (MANDATORY)

1. **First reply — summary only, no command:**

   ```
   即将执行: 停止策略部署
   部署: 「磐石IC 4.0」(dep-xxx), 当前状态 running
   影响: 执行器停止, 不再调仓; 已有持仓保留不动
   确认执行吗? (回复"确认"后我才会执行)
   ```

2. **Only after the user explicitly agrees in a NEW message**: run with
   `--confirm`. Any changed detail (different id, stop→start) → back to 1.

Rules:
- Intent in the same message ("stop it now!") is NOT confirmation — an
  explicit follow-up agreement is required.
- Never batch two deployments in one confirmation; one at a time.
- If the user says cancel/等等 — stop, do nothing.
- Never fabricate or assume a confirmation. Ever.

## Interpreting the result

Output: `action`, `status` (deployment status after the action). Verify with
`openalpha overview` — the deployment row (and anomaly list) updates within
seconds. Report the real post-action status, not the expected one.

## Error dictionary for deploy

- `403 API_KEY_SCOPE_DENIED` → key lacks `deploy` scope; tell the user to
  create/adjust a key with the deploy scope (设置 → 安全 → API Keys).
- `404` → unknown deployment id — check `openalpha deployments`.
- Refusal without `--confirm` (exit 1) → you skipped the protocol; complete
  the confirmation first.
