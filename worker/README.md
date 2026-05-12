# TenderGo Worker

這份文件是給**非專業工程師**看的 Cloudflare Worker 部署與維運指南。  
你可以照著做，不需要先理解所有程式細節。

---

## 0. 你會完成什麼？

照完本文件，你會完成以下目標：

1. 在 Cloudflare 建立資料庫（D1）。
2. 設定必要的密鑰（secret）。
3. 套用資料表 migration（建立資料表）。
4. 在本機啟動 Worker 並做 API 測試。
5. 手動跑一次爬蟲，確認資料有進資料庫。
6. 部署到正式環境並檢查排程是否正常。

---

## 1. 先確認環境（不要跳過）

請先確認你有安裝：

- Node.js（建議 20 以上）
- npm（通常會跟 Node.js 一起安裝）
- Cloudflare 帳號（可登入 dashboard）

可先執行：

```bash
node -v
npm -v
```

如果指令顯示「找不到」，請先安裝 Node.js 再繼續。

---

## 2. 初始化專案與登入 Cloudflare

### Step 2-1. 進入 worker 資料夾

```bash
cd worker
```

### Step 2-2. 安裝套件

```bash
npm install
```

### Step 2-3. 登入 Cloudflare（第一次一定要做）

```bash
npx wrangler login
```

成功時會開瀏覽器讓你授權。

---

## 3. 建立 D1 資料庫並綁定 `database_id`

### Step 3-1. 建立資料庫

```bash
npx wrangler d1 create tendergo-db
```

你會看到一段輸出，裡面有：

- `database_id`

### Step 3-2. 設定到 `wrangler.toml`

把剛剛取得的 `database_id`，貼到 `worker/wrangler.toml` 對應欄位。  
**不要打錯字、多空格或少引號**，否則會連不到資料庫。

---

## 4. 設定敏感資訊（Secret）

`ADMIN_RUN_TOKEN` 用來保護手動觸發爬蟲的管理 API。  
請不要把正式 token 直接硬寫在程式碼或公開 repo。

```bash
npx wrangler secret put ADMIN_RUN_TOKEN
```

系統會要你輸入值，建議使用長且隨機的字串，例如：

- 至少 24 字元
- 同時包含大小寫、數字、符號

> 建議把這個 token 保存到密碼管理器（1Password / Bitwarden 等）。

---

## 5. 套用 migration（建立資料表）

這一步是**最常漏掉**的。

### 本機資料庫（開發測試）

```bash
npx wrangler d1 migrations apply tendergo-db --local
```

### 雲端資料庫（正式環境）

```bash
npx wrangler d1 migrations apply tendergo-db --remote
```

> 重點：`--local` 和 `--remote` 是兩個不同環境，要分開執行。

---

## 6. 本機啟動 Worker

```bash
npm run dev
```

正常情況下你會看到本機網址（常見是 `http://127.0.0.1:8787`）。

---

## 7. 本機驗證（請按順序）

### Step 7-1. 健康檢查 API

```bash
curl "http://127.0.0.1:8787/api/health"
```

預期：回傳類似 `ok: true`。

### Step 7-2. 手動觸發爬蟲（管理 API）

```bash
curl "http://127.0.0.1:8787/api/admin/run-crawl?token=你的ADMIN_RUN_TOKEN"
```

預期：回傳 `inserted / ignored / failed` 等統計。

### Step 7-3. 查詢資料是否入庫

```bash
curl "http://127.0.0.1:8787/api/tenders?page=1&pageSize=5"
```

只要看到資料陣列有內容，代表流程「抓取 → 解析 → 寫入 → 查詢」已打通。

---

## 8. 部署到 Cloudflare Workers（正式環境）

```bash
npm run deploy
```

部署完成後，請立刻測正式 health API：

```bash
curl "https://<你的-worker>.workers.dev/api/health"
```

如果這裡失敗，先不要改前端，先把後端問題解掉。

---

## 9. 驗證排程（Cron）是否生效

1. 打開 Cloudflare Dashboard。  
2. 進入 Workers → 你的 Service → **Triggers**。  
3. 確認 Cron 規則存在且啟用。  
4. 到 Logs 檢查是否有排程觸發紀錄。

如果當天來源網站沒有新資料，`ignored` 增加是正常，不代表壞掉。

---

## 10. 前端串接建議順序

建議先串最簡單的列表頁，確認穩定再做詳細頁。

- 列表頁：`GET /api/tenders`
- 詳細頁：`GET /api/tenders/:tenderId`

這樣可以快速定位問題在「前端畫面」還是「後端資料」。

---

## 常見錯誤與排查（新手強化版）

### 1) `401 Unauthorized`（觸發管理 API 時）

可能原因：

- `?token=` 傳的值不對
- 你以為有設 secret，但其實設到錯的 Cloudflare 帳號或專案

排查建議：

1. 重新執行 `wrangler secret put ADMIN_RUN_TOKEN`
2. 確認你目前登入的是正確帳號（`wrangler login`）
3. 重試 curl，確定 token 完整貼上（不要有空白）

### 2) `D1_ERROR: no such table: tenders`

可能原因：

- migration 尚未執行
- 只跑了 `--local`，沒跑 `--remote`（或相反）

排查建議：

1. 先補跑 `--local` migration
2. 再補跑 `--remote` migration
3. 重新執行 API 測試

### 3) API 正常但抓不到資料

可能原因：

- 來源網站暫時沒有新資料
- 來源頁面 HTML 結構改版，解析規則失效

排查建議：

1. 先看 `run-crawl` 回傳的 `failed` 是否異常增加
2. 檢查解析邏輯（例如 `parseTenderTable.ts`）是否需更新
3. 先在本機修正，再重新部署

### 4) 部署成功但正式環境查不到資料

可能原因：

- 你只有本機 migration，正式資料庫沒有資料表
- 本機測試資料在 local DB，與 remote DB 本來就不同

排查建議：

1. 執行 `npx wrangler d1 migrations apply tendergo-db --remote`
2. 重新手動觸發一次正式環境爬蟲
3. 再查正式 API

---

## 最後檢查清單（照這張核對最不容易出錯）

- [ ] `npm install` 已完成
- [ ] `wrangler login` 已成功
- [ ] D1 `database_id` 已正確填入 `wrangler.toml`
- [ ] `ADMIN_RUN_TOKEN` 已用 secret 設定
- [ ] migration 已執行（local + remote）
- [ ] `/api/health` 本機測試成功
- [ ] `/api/admin/run-crawl` 本機測試成功
- [ ] `/api/tenders` 查得到資料
- [ ] `npm run deploy` 完成
- [ ] 正式 `/api/health` 成功
- [ ] Dashboard 可看到 cron trigger 與 logs

---

## 快速指令總表（可直接複製）

```bash
cd worker
npm install
npx wrangler login
npx wrangler d1 create tendergo-db
npx wrangler secret put ADMIN_RUN_TOKEN
npx wrangler d1 migrations apply tendergo-db --local
npx wrangler d1 migrations apply tendergo-db --remote
npm run dev
# 新開終端機測試
curl "http://127.0.0.1:8787/api/health"
curl "http://127.0.0.1:8787/api/admin/run-crawl?token=你的ADMIN_RUN_TOKEN"
curl "http://127.0.0.1:8787/api/tenders?page=1&pageSize=5"
npm run deploy
curl "https://<你的-worker>.workers.dev/api/health"
```
