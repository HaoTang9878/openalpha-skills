<div align="center">

# OpenAlpha Skills

**Let your AI agent watch your OpenAlpha quant accounts — one `overview` answers everything.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![CI](https://github.com/HaoTang9878/openalpha-skills/actions/workflows/ci.yml/badge.svg)
[![Claude Code](https://img.shields.io/badge/Claude_Code-compatible-blueviolet)](https://claude.com/claude-code)

</div>

[OpenAlpha](https://openalpha.top) 是一个加密量化策略平台:接入你自己的
OKX/币安账户,一键部署官方或自定义截面策略,平台执行器按时调仓。
这个仓库把 OpenAlpha 带进你的 AI Agent(Claude Code / Codex / OpenClaw 等)——
用自然语言查权益、盯持仓、看部署、逛策略市场。

## 安全模型(Security model)

skill 使用的 API Key 是**服务端强制的只读凭证**——后端在协议层拒绝它发起的
一切非 GET 请求;外加每 key 限流(60 次/分钟)。v1 范围:Agent 只有眼睛;
受控写入(分档确认)在 roadmap 上。资金操作目前请一律在网页端完成。

与 [Minara skills](https://github.com/Minara-AI/minara-skills) 的真实差异:
两者服务端都有确认体系;差别在**范围**——Minara v1 就开放了托管账户的交易,
我们 v1 只开放监控。这是阶段取舍,不是谁更安全。

## v1.2.0 新增

- **`ask "问题"`** — 平台 AI 问答, 服务端注入你的实时账户上下文, 按 token
  真实用量计费(与网页 AI 同一钱包)。需 key 带 `ask` 分档。
- **`deploy stop|start <id> --confirm`** — 受控部署启停(key 需 `deploy` 分档;
  仅这两个端点; CLI 无 `--confirm` 拒绝执行, 配合 SKILL 的两段式确认协议)。
- **`openalpha login` 设备码流** — 无参 login 即发起: 打开浏览器批准链接,
  CLI 轮询自动拿 key 落盘, 零复制粘贴。
- **scope 分档** — read / ask / deploy, 创建时勾选, 服务端白名单强制。

## 功能

- **`overview` 一发入魂** — 跨所总权益/今日盈亏/部署真实曲线指标/异常清单,
  **所有跨侧算术在服务端完成**(不让 LLM 做金额加法)
- **账户** — 双所余额、今日盈亏、持仓(**默认实盘**, `--demo` 显式切换)
- **部署** — 策略部署(执行器权益曲线:累计/年化/回撤)+ V40 订单流机器人
- **研究** — 官方策略市场、因子库检索
- **零摩擦登录** — `openalpha login --key oa_...` 写 `~/.openalpha/config.json`,
  无需改 shell profile

数据诚实是硬规则:查询失败的侧显示"未知"(绝不显示 $0);样本不足的指标
显示"—"(绝不显示 0%)。

## 安装(Claude Code)

把下面这段话发给你的 Claude Code(装的是钉死的 release tag,不是漂移的 main):

```
Run "curl -fsSL https://raw.githubusercontent.com/HaoTang9878/openalpha-skills/v1.1.0/scripts/claudecode-openalpha-skill-setup.sh | bash" to install the OpenAlpha skill. Follow the instructions it prints at the end.
```

其它 Agent: `git clone` 本仓库,把 `skills/openalpha/` 拷进你的 Agent 的
skills 目录,确保 `skills/openalpha/bin/openalpha` 可执行(Node ≥ 18)。

## 快速开始

```bash
# 1. 网页端创建 key(设置 → 安全 → API Keys, 明文只显示一次)
openalpha login --key oa_...

# 2. 一发看全貌
openalpha overview

# 3. 按需深入
openalpha balance --exchange binance        # 默认实盘侧
openalpha positions                         # 默认 LIVE, --demo 切模拟
openalpha deployments                       # 策略部署+曲线指标
openalpha ask "我的部署健康吗"          # 平台 AI(计费, 需 ask scope)
openalpha strategies                        # 策略市场
openalpha market listings                  # 新上市永续雷达
openalpha factors 动量                       # 因子库
```

## 命令一览

| 命令 | 作用 |
|------|------|
| `login --key` / `logout` / `status` | key 落盘(0600)/移除/来源诊断 |
| `whoami` | 当前用户/plan/鉴权方式 |
| `overview` | **首选**: 跨所权益+PnL+部署指标+异常, 服务端算术 |
| `balance [--exchange] [--demo\|--both]` | 单所余额(默认实盘) |
| `positions [--exchange] [--demo] [--symbol]` | 持仓(默认实盘) |
| `deployments` / `deployment <id>` | 策略部署列表/详情 |
| `bots` | V40 订单流机器人 |
| `strategies` / `strategy <id>` | 策略市场 |
| `factors [query]` | 因子库 |

所有命令支持 `--json`;限流 60 次/分钟/key(429 带 Retry-After)。
错误语义与高频状态(未配置交易所/451/限流)见
[错误字典](skills/openalpha/references/errors.md)。

## 测试

黄金测试(夹具服务器 + 真实 CLI 子进程断言):`node tests/run.mjs` —
22 例,CI 跑 Node 18/20/22 三矩阵。

## Roadmap(诚实版)

- [x] ~~ask 计费接入~~ / ~~受控部署启停~~ / ~~device-code 登录~~ (v1.2.0)
- [x] ~~ask requestId 幂等(重试不重复扣费) / 市场上下文增富(恐贪·trending·链TVL) / 双所新上市永续雷达 / key 删除 2FA 闸~~ (v1.3.0)
- [ ] key TTL / 审计日志(调用明细)
- [ ] 策略工作流级 AI(生成/回测编排, 走平台四档确认)
- [ ] ClawHub / npm 分发

## License

MIT
