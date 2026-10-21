<div align="center">

# OpenAlpha Skills

**Let your AI agent monitor your OpenAlpha quant accounts — read-only, by design.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude_Code-compatible-blueviolet)](https://claude.com/claude-code)
[![Read-only](https://img.shields.io/badge/scope-read--only-green)](#安全模型-security-model)

</div>

[OpenAlpha](https://openalpha.top) 是一个加密量化策略平台:接入你自己的
OKX/币安账户,一键部署官方或自定义截面策略,平台执行器按时调仓。
这个仓库把 OpenAlpha 带进你的 AI Agent(Claude Code / Codex / OpenClaw 等)——
用自然语言查权益、盯持仓、看部署、逛策略市场。

> **安全模型(Security model)**: skill 使用的 API Key 是**服务端强制的只读凭证**——
> 后端拒绝它发起的一切非 GET 请求。下单、划转、提现、启停部署在协议层就不可能,
> 不是靠 prompt 自觉。资金操作请一律在 OpenAlpha 网页端完成。

## 功能

- **账户与资金** — 双所(OKX/币安)实时权益、今日盈亏、实盘/模拟双侧面
- **持仓** — 开放持仓快照,按标的/方向/未实现盈亏
- **部署** — 策略部署列表与事件日志(运行状态体检)
- **策略市场** — 官方策略与回测指标浏览
- **因子库** — 因子注册表检索

## 安装(Claude Code)

把下面这段话发给你的 Claude Code:

```
Run "curl -fsSL https://raw.githubusercontent.com/HaoTang9878/openalpha-skills/main/scripts/claudecode-openalpha-skill-setup.sh | bash" to install the OpenAlpha skill. Follow the instructions it prints at the end.
```

其它 Agent(手动安装): `git clone` 本仓库,把 `skills/openalpha/` 拷进你的
Agent 的 skills 目录,确保 `skills/openalpha/bin/openalpha` 可执行(Node ≥ 18)。

## 快速开始

```bash
# 1. 在 OpenAlpha 网页端 创建 API Key(设置 → 安全 → API Keys, 明文只显示一次)
export OPENALPHA_API_KEY=oa_...

# 2. 验证
openalpha whoami

# 3. 用起来
openalpha balance --exchange binance
openalpha positions --live
openalpha deployments
openalpha strategies
openalpha factors momentum
```

## 命令一览

| 命令 | 作用 |
|------|------|
| `whoami` | 当前用户/plan/鉴权方式 |
| `balance [--exchange okx\|binance] [--live]` | 权益 + 今日盈亏(双侧) |
| `positions [--exchange X] [--live] [--symbol S]` | 持仓快照 |
| `deployments` / `deployment <id>` | 部署列表/详情(事件日志) |
| `strategies` / `strategy <id>` | 策略市场 |
| `factors [query]` | 因子库检索 |

所有命令支持 `--json`;默认 `https://openalpha.top`,可用
`OPENALPHA_BASE_URL` 覆盖。余额查询遵循**数据诚实**语义:查询失败的一侧
显示为错误(未知),绝不显示为 $0。

## 与 Minara skills 的差异

同类产品 [Minara skills](https://github.com/Minara-AI/minara-skills) 把托管
账户的交易能力开放给 Agent;OpenAlpha 刻意相反——**Agent 只有眼睛,没有手**。
写入边界(下单/调仓/提现)永远在网页端与平台自己的确认体系里,这是产品决定,
不是功能缺口。

## License

MIT
