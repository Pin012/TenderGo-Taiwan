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

## 0-1. 先改這 3 個地方（最小可執行必要條件）

在 Codespaces 跑任何指令前，請先確認以下三項：

1. `worker/wrangler.toml` 的 `database_id` 不是預設字串 `CHANGE_ME_DATABASE_ID`
2. 你有把 `ADMIN_RUN_TOKEN` 設成自己的值（本機用 `[vars]`、正式用 `wrangler secret put`）
3. `name = "tendergo-worker"` 是否要改成你自己的 worker 名稱（避免名稱衝突）

> 只要第 1 項沒改，`d1 migrations apply --remote` 幾乎一定會失敗。

---

## 0-2. 你問的重點：要先在 Cloudflare 手動建立 Worker 嗎？

**不用先手動建立。**  
在這個專案裡，通常你只要把 `worker/wrangler.toml` 設好，然後執行：

```bash
cd worker
npm run deploy
```

Wrangler 會用 `wrangler.toml` 裡的 `name` 自動建立（或更新）同名 Worker。

### 什麼時候才需要去 Dashboard 手動建立？

- 你想先在 UI 建空的 Worker 再綁定
- 你要先在 UI 上做特別設定（例如自訂路由）

但就這個專案來說，**不是必要步驟**。

### 你現在的狀況（有 DB、還沒 Worker）最短路徑

1. 確認 `worker/wrangler.toml` 的 `name` 與 `database_id` 已填好
2. 執行 `npx wrangler d1 migrations apply tendergo-db --remote`
3. 執行 `npm run deploy`（這一步會建立 Worker）
4. 測試 `https://<你的-worker>.workers.dev/api/health`

---

## 1. Codespaces 前置確認（不要跳過）

請先確認你有安裝：

- Node.js（建議 20 以上）
- npm（通常會跟 Node.js 一起安裝）
- Cloudflare 帳號（可登入 dashboard）
- 你目前的終端機就在 GitHub Codespaces

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

### Step 2-3. 登入 Cloudflare（Codespaces 固定用這個）

因為 Codespaces 沒有本機桌面，**請直接使用**：

```bash
npx wrangler login --browser=false
```

Wrangler 會在終端機顯示登入連結，請手動複製到你自己的瀏覽器開啟並授權。

授權後可立刻確認：

```bash
npx wrangler whoami
```

---

## 3. 建立 D1 資料庫並綁定 `database_id`

### Step 3-1. 建立資料庫

```bash
npx wrangler d1 create tendergo-db
```

你會看到一段輸出，裡面有：

- `database_id`

### Step 3-2. 設定到 `wrangler.toml`

把剛剛取得的 `database_id`，貼到 `worker/wrangler.toml` 對應欄位（覆蓋 `CHANGE_ME_DATABASE_ID`）。  
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

> 在 Codespaces：
> - 用終端機 `curl` 測試時，`127.0.0.1:8787` 可以直接用。
> - 若要用你電腦瀏覽器開頁面，請到 **Ports** 分頁把 8787 設為 Public/Private（依需求），再用轉發網址。

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

### 0) `Missing file or directory: xdg-open`（你這次遇到的錯誤）

這個錯誤常見於：

- GitHub Codespaces
- 遠端 Linux 主機
- 沒有 GUI 的 Docker / VM

原因：Wrangler 嘗試「自動開瀏覽器」失敗，不是 D1 指令本身壞掉。

排查建議：

1. 先執行 `npx wrangler login --browser=false`
2. 手動複製終端機提供的 OAuth URL 到你自己的瀏覽器
3. 完成授權後，再執行 `npx wrangler d1 create tendergo-db`
4. 若仍失敗，執行 `npx wrangler whoami` 確認登入狀態

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
- [ ] `wrangler login --browser=false` 已成功
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


## Codespaces 專用指令修整（重點）

你已確定都在 Codespaces 執行，請用下面版本：

1. **登入 Cloudflare**
   - ✅ 建議：`npx wrangler login --browser=false`
   - ⚠️ 不建議：`npx wrangler login`（可能因 `xdg-open` 失敗）

2. **本機 API 測試**
   - ✅ 終端機內：
     - `curl "http://127.0.0.1:8787/api/health"`
   - ✅ 從你電腦瀏覽器測試：
     - 改用 Codespaces 的 Port Forwarding URL（不是 `127.0.0.1`）

3. **部署後正式環境測試**
   - ✅ 用 workers.dev 網址測，與 Codespaces 無關：
     - `curl "https://<你的-worker>.workers.dev/api/health"`

4. **當 `wrangler` 行為異常時先做這三個檢查**
   - `npx wrangler whoami`（是否已登入正確帳號）
   - `pwd`（是否在 `worker/`）
   - `cat wrangler.toml`（`database_id` 是否已填入）

---

## 專案部署/爬蟲邏輯檢視結果（你這次加問）

我已檢視 worker 主要流程，最小可執行需要注意：

1. **D1 綁定一定要是你自己的 DB**
   - 來源檔：`worker/wrangler.toml` 的 `[[d1_databases]]`。
   - 若 `database_id` 沒換成你剛建立的值，遠端 migration 與正式 API 會失敗。

2. **管理 token 目前程式以 `c.env.ADMIN_RUN_TOKEN` 比對**
   - 來源檔：`worker/src/index.ts`。
   - 若 token 未設定，`/api/admin/run-crawl` 會回 401。

3. **資料表必須先 migration，再跑爬蟲**
   - 來源檔：`worker/migrations/0001_init.sql` 與 `worker/src/db/tenderRepo.ts`。
   - 否則會出現 `no such table: tenders`。

4. **爬蟲解析依賴來源網站 table 結構**
   - 來源檔：`worker/src/crawler/parseTenderTable.ts`。
   - 如果來源 HTML 大改版，可能抓到 0 筆，這是邏輯特性，不是部署壞掉。

---

## 快速指令總表（可直接複製）

```bash
cd worker
npm install
npx wrangler login --browser=false
npx wrangler d1 create tendergo-db
npx wrangler secret put ADMIN_RUN_TOKEN
npx wrangler d1 migrations apply tendergo-db --local
npx wrangler d1 migrations apply tendergo-db --remote
# 第一次 deploy 會自動建立 worker
npm run deploy
# 本機開發
npm run dev
# 新開終端機測試
curl "http://127.0.0.1:8787/api/health"
curl "http://127.0.0.1:8787/api/admin/run-crawl?token=你的ADMIN_RUN_TOKEN"
curl "http://127.0.0.1:8787/api/tenders?page=1&pageSize=5"
npm run deploy
curl "https://<你的-worker>.workers.dev/api/health"
```
