# TenderGo Worker（Codespaces 專用、零基礎版）

> 這份文件只寫「必須做」的步驟。  
> 按順序做，不要跳步，就能完成最小可執行部署。

---

## A. 先講清楚你到底要登入什麼

你要登入的是：**Cloudflare 帳號（給 Wrangler 使用）**。  
用途：讓 `wrangler` 有權限建立/更新 Worker、操作 D1。

你不是要登入 GitHub，也不是登入前端網站。

---

## B. 必填設定（先填再跑指令）

請先打開 `worker/wrangler.toml`，確認以下欄位：

1. `name`：你的 Worker 名稱（可沿用 `tendergo-worker`）
2. `database_name`：資料庫名稱（預設 `tendergo-db`）
3. `database_id`：**必須是你 Cloudflare D1 的真實 ID**，不能是 `CHANGE_ME_DATABASE_ID`
4. `ADMIN_RUN_TOKEN`：先放本機開發值（例如 `dev-change-me-please`），正式環境會再用 secret 覆蓋

> 如果你目前「只有 DB，還沒有 Worker」，沒關係。第一次 `wrangler deploy` 會自動建立 Worker。

---

## C. 唯一正確順序（照抄即可）

以下全部在 Codespaces 終端機執行：

### Step 1) 進入 worker 目錄

```bash
cd /workspace/TenderGo-Taiwan/worker
```

### Step 2) 安裝套件

```bash
npm install
```

### Step 3) 登入 Cloudflare（Codespaces 必用）

```bash
npx wrangler login --browser=false --callback-host 0.0.0.0 --callback-port 8976
```

授權完成後立刻驗證：

```bash
npx wrangler whoami
```

- 有顯示你的 Cloudflare 使用者資訊 = 成功
- 失敗就不要往下做，先把登入解決

### Step 4) 檢查你填的 `database_id`

```bash
cat wrangler.toml
```

確認 `database_id` 不是 `CHANGE_ME_DATABASE_ID`。

### Step 5) 套用 D1 migration（遠端正式 DB）

```bash
npx wrangler d1 migrations apply tendergo-db --remote
```

> 這行成功，代表資料表已建立在 Cloudflare D1。

### Step 6) 設定正式 secret（覆蓋 `ADMIN_RUN_TOKEN`）

```bash
npx wrangler secret put ADMIN_RUN_TOKEN
```

輸入你自己的長字串 token。

### Step 7) 部署 Worker（若不存在會自動建立）

```bash
npm run deploy
```

### Step 8) 驗證正式 API

```bash
curl "https://<你的-worker-name>.workers.dev/api/health"
```

`<你的-worker-name>` 要和 `wrangler.toml` 的 `name` 一樣。

### Step 9) 手動觸發一次爬蟲

```bash
curl "https://<你的-worker-name>.workers.dev/api/admin/run-crawl?token=<你剛設定的ADMIN_RUN_TOKEN>"
```

### Step 10) 查詢是否有資料

```bash
curl "https://<你的-worker-name>.workers.dev/api/tenders?page=1&pageSize=5"
```

---

## D. 如果你還沒有 D1 database_id（才做這段）

只有在「你沒有 D1 ID」時才執行：

```bash
npx wrangler d1 create tendergo-db
```

執行後把回傳的 `database_id` 貼回 `wrangler.toml`，再回到 Step 5。

---

## E. 嚴格防呆（最常出錯 5 件事）

1. **還沒 `whoami` 成功就 deploy** → 會報登入相關錯誤
2. `database_id` 還是 placeholder → migration/deploy 失敗
3. 在 repo 根目錄跑 deploy（不是 `worker/`）→ 用錯設定
4. `worker name` 和你測試網址不一致 → health URL 打錯
5. 忘了設定 secret 就打 admin API → 401

---

## F. 一次貼上版（已有 database_id 的人）

```bash
cd /workspace/TenderGo-Taiwan/worker
npm install
npx wrangler login --browser=false --callback-host 0.0.0.0 --callback-port 8976
npx wrangler whoami
cat wrangler.toml
npx wrangler d1 migrations apply tendergo-db --remote
npx wrangler secret put ADMIN_RUN_TOKEN
npm run deploy
curl "https://<你的-worker-name>.workers.dev/api/health"
curl "https://<你的-worker-name>.workers.dev/api/admin/run-crawl?token=<你剛設定的ADMIN_RUN_TOKEN>"
curl "https://<你的-worker-name>.workers.dev/api/tenders?page=1&pageSize=5"
```

---

## G. 版本一致性（本專案）

- Worker 專案 deploy 指令：`wrangler deploy`（由 `npm run deploy` 呼叫）
- Worker 專案 dev 指令：`wrangler dev`
- `worker/package.json` 內 wrangler 版本：`^4.15.2`（你本機跑到 `4.90.0` 也可相容）

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


## H. 如何確認「有抓到結構化資料」

完成 deploy 後，請依序執行：

```bash
# 1) 先觸發一次爬蟲
curl "https://<你的-worker-name>.workers.dev/api/admin/run-crawl?token=<ADMIN_RUN_TOKEN>"

# 2) 查最近一次抓取狀態（含筆數 + 範例欄位）
curl "https://<你的-worker-name>.workers.dev/api/admin/crawl-status?token=<ADMIN_RUN_TOKEN>"
```

`crawl-status` 會回傳：
- `hasData`: 是否已有資料
- `latestFetchedDate`: 最近抓取日期
- `latestCount`: 當天筆數
- `sampleRows`: 3 筆結構化資料樣本（`tender_id`, `title`, `agency`, `amount_value`, `start_date`, `end_date`）

若 `hasData=true` 且 `latestCount>0`，代表後端已成功抓到並寫入結構化資料。


## I. 目前會抓到哪些欄位？（對應 DB 制式欄位）

爬蟲解析後，會寫入 `tenders` 這些欄位：
- `tender_id`
- `title`
- `agency`
- `serial_no`
- `bidding_method`
- `amount_text`
- `amount_value`
- `tender_type`
- `start_date`
- `end_date`
- `award_status`
- `award_amount_text`
- `award_amount_value`
- `winning_vendor`
- `source_url`
- `source_hash`
- `fetched_date`

> `id` 與 `created_at` 是 DB 自動產生。

### 這個需要先設定嗎？
**需要。** 你一定要先套用 migration，DB 才會有這些制式欄位。

```bash
cd /workspace/TenderGo-Taiwan/worker
npx wrangler d1 migrations apply tendergo-db --remote
```

### 怎麼確認 DB 欄位真的存在？
```bash
npx wrangler d1 execute tendergo-db --remote --command "PRAGMA table_info(tenders);"
```

看到上面欄位名稱就代表 schema 已建立完成，這時候才可以正常使用 `run-crawl` / `crawl-status`。

## J. 爬蟲現在怎麼跑？（實際程式行為）

### 1) 觸發方式
- **排程自動跑**：由 `wrangler.toml` 的 cron 觸發（目前是每天 4 次）。
- **手動觸發**：呼叫 `/api/admin/run-crawl?token=...`。

### 2) 抓取流程
1. 使用 **Asia/Taipei（台北時區）** 計算「今日日期」（固定時區）。
2. 只用今日日期組搜尋 URL（`tenderStartDate = tenderEndDate = 今日`，`pageSize=100`）。
3. 用固定 header 抓 HTML。
4. 解析表格欄位並轉成結構化資料。
5. 寫入 D1（`INSERT OR IGNORE`，重複資料會忽略）。

### 3) 一次抓幾筆
- 每頁固定 `pageSize=100`。
- 會從 `pageIndex=1` 開始逐頁抓，直到頁面無資料或筆數小於 100 才停止。

### 4) 是否已抓到「所有當日公告」
- 目前策略是「只抓當日公告」，不抓過去日期。
- 若來源網站分頁規則不變，理論上可覆蓋所有當日分頁資料。
- **需確認**：來源站是否有額外隱藏條件/反爬驗證導致漏頁。

### 5) 防爬機制的實務處理
- 本專案目前有基本請求 header（`user-agent`、`accept-language`），並在分頁查詢間加入隨機短延遲。
- 建議採用**合法且低風險**做法：
  - 降低抓取頻率、加上隨機延遲。
  - 明確重試與退避（429/5xx）。
  - 實作分頁與增量抓取，減少單次壓力。
  - 遵守網站服務條款與 robots 規範。
- 不建議也不提供繞過驗證/封鎖的手法。


### 6) 去重規則
- DB 以 `tender_id + title` 做唯一鍵。
- 一天內多次排程重抓時，重複資料會被 `INSERT OR IGNORE` 忽略，只保留唯一值。
