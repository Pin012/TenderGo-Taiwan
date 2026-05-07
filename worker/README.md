# TenderGo Worker

## Setup
1. `cd worker`
2. `npm install`
3. Create D1 and replace `database_id` in `wrangler.toml`.
4. `npx wrangler d1 migrations apply tendergo-db --local`
5. `npm run dev`

## Deploy
- `npm run deploy`


## 手把手：push 完之後的完整流程

以下流程用「你現在已經把程式 push 到 GitHub」為前提。

### Step 1) 在 Cloudflare 建立 D1 資料庫

```bash
cd worker
npx wrangler login
npx wrangler d1 create tendergo-db
```

執行後會拿到 `database_id`，把它貼到 `worker/wrangler.toml` 的 `database_id`。

### Step 2) 設定敏感參數（不要硬寫在檔案）

先把 `wrangler.toml` 內的 `ADMIN_RUN_TOKEN` 當成開發值，正式環境請改用 secret：

```bash
npx wrangler secret put ADMIN_RUN_TOKEN
```

輸入一段長字串，例如 `tendergo-admin-2026-very-long-random`。

### Step 3) 套用資料表 migration

本機測試資料庫：

```bash
npx wrangler d1 migrations apply tendergo-db --local
```

遠端正式資料庫：

```bash
npx wrangler d1 migrations apply tendergo-db --remote
```

### Step 4) 本機啟動 worker

```bash
npm install
npm run dev
```

啟動後記下本機 URL（通常是 `http://127.0.0.1:8787`）。

### Step 5) 先測健康檢查 API

```bash
curl "http://127.0.0.1:8787/api/health"
```

看到 `ok: true` 代表後端有正常起來。

### Step 6) 手動觸發一次爬蟲（非常重要）

```bash
curl "http://127.0.0.1:8787/api/admin/run-crawl?token=你的ADMIN_RUN_TOKEN"
```

你應該會拿到 `inserted / ignored / failed` 的統計結果。

### Step 7) 查詢是否真的入庫

```bash
curl "http://127.0.0.1:8787/api/tenders?page=1&pageSize=5"
```

有資料列出就表示「抓取 -> 解析 -> 入庫 -> 查詢」整條鏈路打通。

### Step 8) 部署到 Cloudflare Workers

```bash
npm run deploy
```

部署完成後，測正式網址：

```bash
curl "https://<你的-worker>.workers.dev/api/health"
```

### Step 9) 驗證每日排程是否會跑

1. 到 Cloudflare Dashboard -> Workers -> 你的 service -> Triggers，確認 cron 已存在。
2. 在 Logs 看是否每天有執行記錄。
3. 若當天沒新資料，`ignored` 變多是正常現象。

### Step 10) 前端開始改接後端 API

在前端把資料來源改成：
- 列表頁：`GET /api/tenders`
- 詳細頁：`GET /api/tenders/:tenderId`

建議先只改列表頁，確認穩定後再改完整篩選。

---

## 常見錯誤排查（新手版）

- **401 Unauthorized（手動觸發時）**
  - token 錯了，確認 `?token=` 與 secret 一致。
- **D1_ERROR: no such table: tenders**
  - migration 還沒 apply 到對應環境（local 或 remote）。
- **抓不到資料但 API 正常**
  - 來源頁面可能改版，需調整 `parseTenderTable.ts`。
- **部署成功但查不到資料**
  - 你可能只 apply 了 local migration，忘了 remote migration。

