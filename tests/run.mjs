#!/usr/bin/env node
/**
 * Golden tests for the openalpha CLI — zero-dependency harness.
 *
 * Spins a fixture HTTP server (canned API responses), runs the real CLI
 * against it as a child process, and asserts stdout/exit-code substrings.
 * Run: node tests/run.mjs   (exit 0 = all pass)
 */
'use strict'

import http from 'http'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFile } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CLI = path.join(__dirname, '..', 'skills', 'openalpha', 'bin', 'openalpha')
const KEY = 'oa_test0000000000000000000000dead'

// ---------- fixtures (shapes mirror the real API) ----------

const fixtures = {
    '/api/auth/me': {
        success: true,
        data: {
            id: 'u1', username: 'alice', role: 'user', plan: 'pro',
            displayName: 'Alice', createdAt: '2026-01-01T00:00:00Z',
            authMethod: 'api_key',
        },
    },
    '/api/agent/overview': {
        success: true,
        data: {
            generatedAt: '2026-10-22T02:00:00.000Z',
            latencyMs: 120,
            balances: [
                { exchange: 'okx', live: { total: 12111.11, today_profit: 33.6, profit_percent: 0.28, latency: 90 }, demo: null },
                { exchange: 'binance', live: { total: 0, today_profit: 0, profit_percent: 0, latency: 50, error: 'upstream timeout' }, demo: null },
            ],
            totals: { liveUsd: 12111.11, liveTodayPnlUsd: 33.6, partial: true, unknownSides: ['binance:live'] },
            strategyDeployments: [{
                id: 'dep-1', name: '磐石IC 4.0', exchange: 'okx', demo: false,
                pool: 'coinfull', symbolCount: 79, initialCapitalUsd: 1000,
                leverage: 1, status: 'running', processAlive: true,
                credentialOk: true, createdAt: '2026-09-01T00:00:00Z',
                metrics: {
                    latestEquityUsd: 12345.0, totalReturnPct: 10.0,
                    annualizedPct: 232.0, maxDrawdownPct: 15.0, days: 29,
                },
            }],
            bots: { total: 4, running: 3 },
            anomalies: ['策略部署「防御档」缺实盘凭证, 执行器每轮空转 —— 请到网页端补配 API Key'],
        },
    },
    '/api/bot/balances': {
        success: true,
        data: {
            live: { total: 1234.56, today_profit: 12.34, profit_percent: 1.01, latency: 80, needsConfig: false },
            demo: { total: 0, today_profit: 0, profit_percent: 0, latency: 0, needsConfig: true },
        },
    },
    '/api/strategy-dev/deployments': {
        success: true,
        data: [{
            id: 'dep-1', name: '磐石IC 4.0', exchange: 'okx', demo: false,
            status: 'running', processAlive: true, credentialOk: true,
            live: { equityCurve: [
                { d: '2026-09-01T00:00:00Z', eq: 1000 },
                { d: '2026-09-30T00:00:00Z', eq: 1100 },
            ] },
        }],
    },
    '/api/bots': {
        success: true,
        data: [
            { id: 'bot-1', name: '以太坊订单流', status: 'running', exchange: 'okx', demo: false },
            { id: 'bot-2', name: '比特币订单流', status: 'running', exchange: 'okx', demo: true },
        ],
    },
    '/api/strategy-market/strategies': {
        success: true,
        data: { strategies: [{
            id: 'st-1', name: '磐石防御档', creator: { name: 'OpenAlpha Labs' },
            totalReturn: 16479.79, annualized: 141.67, sharpeRatio: 2.04,
            maxDrawdown: 28.16,
        }] },
    },
    '/api/strategy-dev/factors': {
        success: true,
        data: { factors: [
            { id: 'momentum30', label: '30 日动量', group: '趋势与动量', implemented: true },
            { id: 'reversal7', label: '7 日反转', group: '均值回归', implemented: true },
        ] },
    },
}

// ---------- fixture server ----------

/** 设备码状态机: create → poll#1 pending → poll#2 approved(带 key) */
const deviceState = { created: false, polls: 0 }
const DEVICE_KEY = 'oa_fixture000000000000000000device'

let reqBody = ''
const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x')
    const auth = req.headers.authorization || ''
    req.on('data', (c) => { reqBody += c })
    req.on('end', handle)
    function handle() {
        let body = {}
        try { body = reqBody ? JSON.parse(reqBody) : {} } catch { body = {} }
        reqBody = ''
        const reply = (status, obj) => {
            res.writeHead(status, { 'content-type': 'application/json' })
            res.end(JSON.stringify(obj))
        }
        if (u.pathname === '/api/auth/device-code' && req.method === 'POST') {
            deviceState.created = true
            deviceState.polls = 0
            return reply(201, { success: true, data: {
                code: 'TEST-CODE', verifyUrl:
                    'https://openalpha.top/auth/device?code=TEST-CODE',
                expiresInSec: 600 } })
        }
        if (u.pathname === '/api/auth/device-code/TEST-CODE'
            && req.method === 'GET') {
            deviceState.polls += 1
            if (deviceState.polls >= 2) {
                return reply(200, { success: true, data: {
                    status: 'approved', key: DEVICE_KEY,
                    scopes: ['read', 'ask'] } })
            }
            return reply(200, { success: true, data: { status: 'pending' } })
        }
        if (u.pathname === '/api/agent/ask' && req.method === 'POST') {
            if (auth !== `Bearer ${KEY}`) {
                return reply(401, { success: false, message: 'unauthorized' })
            }
            if (String(body.question || '').includes('poor')) {
                return reply(402, { success: false, error: {
                    kind: 'HTTP',
                    message: '钱包余额不足：AI 问答需要正余额。',
                    code: 'AGENT_ASK_NO_BALANCE' } })
            }
            return reply(200, { success: true, data: {
                answer: '你的部署全部健康(基于真实上下文)。',
                tokens: 1200, chargedUsd: 0.0024, balance: 4.9976,
                requestId: body.requestId || null } })
        }
        if (u.pathname === '/api/agent/market/listings') {
            if (auth !== `Bearer ${KEY}`) {
                return reply(401, { success: false, message: 'unauthorized' })
            }
            return reply(200, { success: true, data: {
                listings: [
                    { exchange: 'okx', symbol: 'XYZ/USDT:USDT',
                        rawSymbol: 'XYZ-USDT-SWAP',
                        listTime: 1, daysListed: 2 },
                    { exchange: 'binance', symbol: 'ABC/USDT:USDT',
                        rawSymbol: 'ABCUSDT', listTime: 1, daysListed: 5 },
                ],
                errors: ['binance 本次拉取失败, 沿用缓存'],
                windowDays: 14 } })
        }
        const mDep = u.pathname.match(
            /^\/api\/strategy-dev\/deployments\/([^/]+)\/(stop|restart)$/)
        if (mDep && req.method === 'POST') {
            if (auth !== `Bearer ${KEY}`) {
                return reply(401, { success: false, message: 'unauthorized' })
            }
            return reply(200, { success: true, data: {
                status: mDep[2] === 'stop' ? 'stopped' : 'running' } })
        }
        route(req, res)
    }
    // 原 GET 逻辑保留在 route()
    function route(req, res) {
    // positions 特例: demo=true 返回未配置(高频真实状态); 其它按表
    if (u.pathname === '/api/trade/positions') {
        if (auth !== `Bearer ${KEY}`) {
            res.writeHead(401, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ success: false, message: 'API key 无效或已吊销' }))
            return
        }
        if (u.searchParams.get('demo') === 'true') {
            res.writeHead(400, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: '未配置 API Key' }))
            return
        }
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({
            success: true,
            updatedAt: '2026-10-22T02:00:00Z',
            data: [{ symbol: 'BTC-USDT-SWAP', side: 'long', size: '0.05',
                entryPrice: '67200', markPrice: '67510',
                unrealizedPnl: '15.5', leverage: '3' }],
        }))
        return
    }
    if (auth !== `Bearer ${KEY}`) {
        res.writeHead(401, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ success: false, message: '未提供认证令牌' }))
        return
    }
    const body = fixtures[u.pathname]
    if (!body) {
        res.writeHead(404, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ success: false, error: 'not found' }))
        return
    }
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(body))
    }
})

// ---------- harness ----------

let failures = 0
let passes = 0

// 异步 execFile: 父进程事件循环必须保持转动给夹具服务器应答 —— 用
// spawnSync 会父等子/子等响应, 直接死锁(实测)
function run(args, env) {
    return new Promise((resolve, reject) => {
        execFile(process.execPath, [CLI, ...args], {
            env: { ...process.env, ...env },
            encoding: 'utf8',
            timeout: 15000,
        }, (err, stdout, stderr) => {
            const code = err ? err.code : 0
            resolve({ code: typeof code === 'number' ? code : null,
                stdout: stdout || '', stderr: stderr || '' })
        })
    })
}

async function check(name, args, env, expectCode, mustContain, mustNotContain) {
    try {
        const { stdout, stderr, code } = await run(args, env)
        if (expectCode !== undefined && code !== expectCode) {
            throw new Error(`exit ${code} !== ${expectCode} for [${args.join(' ')}]\n`
                + `stdout: ${stdout.slice(0, 400)}`)
        }
        // 错误信息走 stderr(die), 断言面向两流之和
        const all = stdout + '\n' + stderr
        for (const frag of mustContain) {
            if (!all.includes(frag)) {
                throw new Error(`output missing "${frag}"\n--- got ---\n${all}`)
            }
        }
        for (const frag of mustNotContain || []) {
            if (all.includes(frag)) {
                throw new Error(`output unexpectedly contains "${frag}"\n${all}`)
            }
        }
        passes++
        console.log(`ok   ${name}`)
    } catch (e) {
        failures++
        console.error(`FAIL ${name}\n${e.message}\n`)
    }
}

const baseEnv = (home) => ({
    OPENALPHA_BASE_URL: `http://127.0.0.1:${server.address().port}`,
    OPENALPHA_API_KEY: KEY,
    HOME: home,
})

server.listen(0, '127.0.0.1', async () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'oa-cli-test-'))

    const E = baseEnv(home)

    await check('whoami', ['whoami'], E, 0, ['alice', 'pro', 'api_key'])
    await check('overview renders server totals + partial + anomaly', ['overview'], E, 0,
        ['$12,111.11', '$33.60', 'binance:live', 'NOT counted as 0',
            '磐石IC 4.0', '$12,345.00', '232.00%', '15.00%',
            '3/4 running', '缺实盘凭证'])
    await check('overview --json parses and echoes totals', ['overview', '--json'], E, 0,
        ['"liveUsd": 12111.11', '"partial": true'])
    await check('balance defaults to LIVE (not demo)', ['balance'], E, 0,
        ['[live]', '$1,234.56', 'live side shown'])
    await check('balance --demo reports not-configured', ['balance', '--demo'], E, 0,
        ['[demo]', 'not configured'])
    await check('balance --both shows both sides', ['balance', '--both'], E, 0,
        ['[live]', '[demo]'])
    await check('positions defaults to LIVE and labels it', ['positions'], E, 0,
        ['account      LIVE', 'BTC-USDT-SWAP'])
    await check('positions --demo surfaces 未配置 with guidance', ['positions', '--demo'], E, 1,
        ['未配置 API Key', '交易所连接'])
    await check('deployments: executor curve metrics', ['deployments'], E, 0,
        ['磐石IC 4.0', '$1,100.00', '10.00%'])
    await check('deployment <id> returns JSON detail', ['deployment', 'dep-1'], E, 0,
        ['"id": "dep-1"', 'equityCurve'])
    await check('deployment unknown id fails clean', ['deployment', 'nope'], E, 1,
        ['not found'])
    await check('bots list', ['bots'], E, 0, ['以太坊订单流', 'running'])
    await check('strategies: creator object unfolded', ['strategies'], E, 0,
        ['OpenAlpha Labs', '16479.79'])
    await check('factors filter', ['factors', '动量'], E, 0, ['momentum30'],
        ['reversal7'])
    await check('help lists overview/login', ['help'], E, 0,
        ['overview', 'login --key', 'READ-ONLY'])

    // ---- ask / deploy (scoped actions) ----
    check('ask sends requestId (server echo)', ['ask', 'x', '--json'], E, 0,
        ['"requestId": "cli-'])
    // 会话连续性: 第一次写 state, 第二次请求体带同一 conversationId
    const askHome = fs.mkdtempSync(path.join(os.tmpdir(), 'oa-ask-conv-'))
    const askEnv = { ...E, HOME: askHome }
    await check('ask first call seeds conversation',
        ['ask', '你好'], askEnv, 0, ['全部健康'])
    const st1 = JSON.parse(fs.readFileSync(
        path.join(askHome, '.openalpha', 'state.json'), 'utf8'))
    if (st1.lastConversationId && st1.lastConversationId.startsWith('conv-')) {
        passes++; console.log('ok   conversation state seeded')
    } else { failures++; console.error('FAIL state:', JSON.stringify(st1)) }
    await check('ask second call continues conversation',
        ['ask', '再说点'], askEnv, 0, ['全部健康'])
    fs.rmSync(askHome, { recursive: true, force: true })
    check('market listings renders + degrade note', ['market', 'listings'], E, 0,
        ['新上市 USDT 永续', 'XYZ/USDT:USDT', 'ABC/USDT:USDT',
            '数据降级'])
    await check('ask renders answer + billing footer', ['ask', '我的部署健康吗'], E, 0,
        ['你的部署全部健康', 'tokens 1200', 'charged $0.0024', 'balance $4.9976'])
    await check('ask 402 surfaces wallet guidance', ['ask', 'poor question'], E, 1,
        ['402', '钱包余额不足', '钱包'])
    await check('deploy refuses without --confirm', ['deploy', 'stop', 'dep-1'], E, 1,
        ['without --confirm', 'explicitly agree'])
    await check('deploy stop --confirm executes', ['deploy', 'stop', 'dep-1', '--confirm'], E, 0,
        ['action       stop dep-1', 'status       stopped'])
    await check('deploy start maps to restart', ['deploy', 'start', 'dep-9', '--confirm'], E, 0,
        ['status       running'])

    // ---- device-code login flow (独立 HOME, 夹具两轮轮询后 approved) ----
    const devHome = fs.mkdtempSync(path.join(os.tmpdir(), 'oa-dev-login-'))
    const devEnv = {
        OPENALPHA_BASE_URL: `http://127.0.0.1:${server.address().port}`,
        HOME: devHome,
    }
    await check('login device flow: approve → config saved',
        ['login', '--name', 'golden-test'], devEnv, 0,
        ['TEST-CODE', 'approved', 'key saved to', 'scopes: read, ask'])
    const devCfg = JSON.parse(
        fs.readFileSync(path.join(devHome, '.openalpha', 'config.json'), 'utf8'))
    if (devCfg.apiKey === DEVICE_KEY) {
        passes++; console.log('ok   device key persisted correctly')
    } else {
        failures++; console.error('FAIL device key mismatch:', devCfg.apiKey)
    }
    fs.rmSync(devHome, { recursive: true, force: true })

    // ---- credential flows (config file; env removed) ----
    const noKeyEnv = {
        OPENALPHA_BASE_URL: `http://127.0.0.1:${server.address().port}`,
        HOME: home,
    }
    // 未配置: 提示 login, 退出码 2
    await check('no key anywhere → exit 2 with hint', ['whoami'],
        { ...noKeyEnv, OPENALPHA_API_KEY: '' }, 2,
        ['openalpha login --key'])
    // login 写 config(0600)
    await check('login saves key to config', ['login', '--key', KEY], noKeyEnv, 0,
        ['key saved to', 'mode 600'])
    const cfgPath = path.join(home, '.openalpha', 'config.json')
    const mode = fs.statSync(cfgPath).mode & 0o777
    if (mode === 0o600) { passes++; console.log('ok   config file mode 600') }
    else { failures++; console.error(`FAIL config mode ${mode.toString(8)} !== 600`) }
    // 无 env 时 config 生效
    await check('config-file key works without env', ['whoami'], noKeyEnv, 0, ['alice'])
    // status 显示来源与前缀
    await check('status shows source+prefix', ['status'], noKeyEnv, 0,
        ['config', `${KEY.slice(0, 12)}…`])
    // logout 移除
    await check('logout removes key', ['logout'], noKeyEnv, 0, ['key removed'])
    await check('after logout status exits 2', ['status'], noKeyEnv, 2,
        ['NOT CONFIGURED'])

    server.close()
    console.log(`\n${passes} passed, ${failures} failed`)
    process.exit(failures > 0 ? 1 : 0)
})
