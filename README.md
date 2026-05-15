# 🇹🇼 標案通 TenderGo - 政府標案查詢手機 Web App (MVP)

![TenderGo Banner](https://img.shields.io/badge/Status-MVP-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

「標案通 TenderGo」是一個專為工程顧問公司、商務開發者設計的政府標案查詢 App 雛形。透過手機優先 (Mobile-First) 的介面設計，將繁瑣的政府採購網資訊轉化為易於閱讀與追蹤的數位工具。

## 🌟 核心理念
政府標案資訊往往分散且難以在行動端閱讀。「標案通」的目標是將資料結構化，並透過進階篩選與即時通知，協助專業人士不漏接任何一個關鍵商機。

## ✨ MVP 功能清單
- [x] **手機優先 RWD 設計**：採用「Bento Grid」風格，完美適配各種螢幕尺寸。
- [x] **進階篩選介面**：模擬真實查詢邏輯（案名、機關、案號、預算金額區間）。
- [x] **標案追蹤功能**：支援本地存儲 (LocalStorage)，關閉網頁後追蹤清單不遺失。
- [x] **即時商機模擬**：內建通知系統模擬，展示未來 AI 自動推薦標案的可能性。
- [x] **資料詳情面板**：一鍵跳轉至官方「政府電子採購網」原始頁面。

## 🏗️ 技術架構
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **Animation**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Data Source**: 
  - 前端優先呼叫 Worker API (`/api/tenders`)。
  - 若 API 不可用，會 fallback 到 `mockData` 模擬資料，確保 UI 可展示。
  - 資料結構參考 [openfunltd/pcc.g0v.ronny.tw](https://github.com/openfunltd/pcc.g0v.ronny.tw) 開源專案。

## 🚀 快速上手 (Development)

### 在 Google AI Studio 環境
1. 點擊 **Preview** 即可在右側視窗查看即時 App 效果。
2. 修改 `src/data/mockTenders.ts` 即可更新標案資料內容。

### 在本機開發環境
```bash
# 安裝依賴
npm install

# 設定前端 API Base URL（可留空，預設同網域）
cp .env.example .env

# 啟動開發伺服器
npm run dev
```

## 📅 未來發展路徑 (Roadmap)
- **Phase 2**: 串接真實政府採購 API (透過 g0v 或 Pcc API)。
- **Phase 3**: 導入 Gemini AI 標案摘要與適配性分析。
- **Phase 4**: 串接 LINE / Telegram 通知 Bot。

## 🤝 致謝
特別感謝 **g0v 零時政府** 社群在政府開放資料上的長期貢獻，本專案之資料欄位邏輯深度參考其相關開源專案。

---
*本專案目前為開發雛形版本，僅供 UI/UX 功能演示使用。*


## 🕷️ Phase 2 實作藍圖：Cloudflare Workers + D1 每日爬蟲資料庫

> 你目前的前端已在 Cloudflare Pages，最穩定的下一步就是把「爬蟲 + 資料庫 + API」也放在 Cloudflare 生態系，讓部署、權限、排程、成本都簡化。

### 0) 先理解最終目標（白話）
你要的是一個**每天自動跑一次**的小型資料管線：

1. Worker 定時觸發（例如每天台灣時間早上 7 點）。
2. Worker 去抓指定政府頁面（或你後續上傳的 HTML）。
3. 解析表格，把每一列轉成結構化資料（JSON）。
4. 寫進 D1（SQLite）資料庫，並標記「抓取日期」。
5. 前端查詢時只打你自己的 API，不再直接打政府頁面。

這樣前端就會更快、可篩選、可做收藏與統計，也不怕目標網站偶爾慢或改版。

---

### 1) 你目前缺少的後端架構元件（清單）
目前 repo 只有前端 MVP。要補齊以下元件：

- **Cloudflare Worker 專案**：提供 API 與排程邏輯。
- **D1 資料庫**：存每日爬取結果。
- **資料表 Schema**：定義欄位（案號、機關、金額、截止日…）。
- **爬蟲解析模組**：把 HTML 表格轉成結構化物件。
- **去重與版本策略**：避免每天重複插入同一案。
- **前端改接 API**：`src/data/mockTenders.ts` 逐步替換成 fetch。
- **監控與錯誤通知**：至少先有 Worker logs，後續可加 webhook。

---

### 2) 後端技術選型（為什麼這樣選）

- **Runtime**：Cloudflare Workers
  - 優點：免伺服器、和 Pages 同平台、可原生定時 Cron。
- **DB**：Cloudflare D1
  - 優點：SQLite 心智模型簡單，早期 MVP 成本低、查詢直覺。
- **HTML 解析**：`linkedom`（建議）
  - 原因：Workers 沒有完整瀏覽器 DOM，`linkedom` 可以在 Worker 裡解析 table。
- **驗證**：`zod`（建議）
  - 原因：防止解析欄位空值或格式不穩定，減少髒資料入庫。
- **HTTP Router**：`hono`（建議）
  - 原因：寫 API 比原生 `fetch` handler 好維護。

---

### 3) 實作步驟（手把手）

#### Step A：建立 Workers 專案
在 repo 根目錄下新增 `worker/` 子專案：

```bash
npm create cloudflare@latest worker -- --type=hello-world
cd worker
npm install hono zod linkedom
```

> 若你偏好不分資料夾，也可把 Worker 放同一層。但「前後端分開資料夾」對初學者較好維護。

#### Step B：建立 D1 資料庫

```bash
npx wrangler d1 create tendergo-db
```

Wrangler 會回傳 `database_id`，把它貼到 `worker/wrangler.toml`：

```toml
name = "tendergo-worker"
main = "src/index.ts"
compatibility_date = "2026-05-06"

[[d1_databases]]
binding = "DB"
database_name = "tendergo-db"
database_id = "貼上剛剛的ID"

[triggers]
crons = ["0 23 * * *"] # UTC 23:00 = 台灣 07:00
```

#### Step C：建立資料表（重點）
先建 migration 檔（例如 `worker/migrations/0001_init.sql`）：

```sql
CREATE TABLE IF NOT EXISTS tenders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tender_id TEXT NOT NULL,
  title TEXT,
  agency TEXT,
  amount_text TEXT,
  amount_value INTEGER,
  tender_type TEXT,
  start_date TEXT,
  end_date TEXT,
  source_url TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  fetched_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP -- 目前程式實際會以 Asia/Taipei 明確寫入
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenders_unique_daily
ON tenders (tender_id, fetched_date);

CREATE INDEX IF NOT EXISTS idx_tenders_agency ON tenders (agency);
CREATE INDEX IF NOT EXISTS idx_tenders_end_date ON tenders (end_date);
```

套用 migration：

```bash
npx wrangler d1 migrations apply tendergo-db --local
npx wrangler d1 migrations apply tendergo-db --remote
```

#### Step D：做「抓取 + 解析」函式
在 Worker 內做 2 個函式：

1. `fetchTenderHtml(url)`：只負責下載 HTML。
2. `parseTenderTable(html)`：只負責把 table -> array。

拆開的好處：
- 目標網站改版時，你只改 parser。
- 你提供本地 HTML 檔時，可直接測 parser，不用一直打外網。

#### Step E：儲存資料（含去重）
每筆資料寫入時使用 `INSERT OR IGNORE`（搭配 unique index）。

意思是：
- 同一天、同一 tender_id 已存在就跳過。
- 每天仍可保留快照，方便做「昨日 vs 今日」比較。

#### Step F：建立 API 給前端用
至少先做這三支：

- `GET /api/tenders?date=2026-05-06&page=1&pageSize=20`
- `GET /api/tenders/:tenderId`
- `GET /api/health`

前端就改成呼叫以上 API，畫面資料不再來自 mock。

#### Step G：排程每天自動跑
在 Worker 增加 `scheduled` handler，流程：

1. 用當天日期組查詢網址。
2. 抓 HTML。
3. parse。
4. 寫入 D1。
5. 記錄成功筆數與錯誤訊息。

---

### 4) 你的指定網址要怎麼處理（重要）
你提供的入口網址帶了 `tenderStartDate` / `tenderEndDate`。建議不要寫死，改成每天動態產生，例如：

- `tenderStartDate = 今天 - 6 天`
- `tenderEndDate = 今天`

這樣可容錯（某天排程失敗時，隔天仍能補到最近資料）。

另外，若該站有 anti-bot 或需要特定 headers，先加：
- User-Agent
- Accept-Language: zh-TW

---

### 5) 前端要改哪些地方

1. 新增 `src/services/api.ts`：集中呼叫後端 API。
2. `src/App.tsx` 把 `mockTenders` 改成非同步載入。
3. `src/types/tender.ts` 對齊後端欄位（例如 `fetchedDate`, `agency`, `tenderId`）。
4. 篩選邏輯優先移到後端 query（大量資料時效能較好）。

---

### 6) 建議的資料庫欄位設計（你會常用到）

- `tender_id`：案號（核心鍵）
- `title`：標案名稱
- `agency`：機關名稱
- `amount_text`：原始金額字串
- `amount_value`：可排序的數字金額
- `start_date` / `end_date`：公告/截止
- `fetched_date`：哪一天抓的（做每日快照）
- `source_hash`：來源列 hash（偵測內容是否變更）

---

### 7) 測試與上線順序（建議照做）

1. **本機 parser 測試**：先餵你「後續上傳的 HTML」檔，確認欄位抓得到。
2. **本機 D1 測試**：`wrangler dev` + `d1 --local`，確認入庫。
3. **手動觸發一次排程邏輯**：確認會寫資料。
4. **部署到 Cloudflare**：觀察 logs 至少 3 天。
5. **前端改 API**：先做唯讀列表，再補詳細頁與篩選。

---

### 8) 你最容易踩的坑（先避開）

- **欄位位置寫死**：HTML table 欄位順序改了就壞；要用表頭名稱對映。
- **只存字串金額**：後續無法做排序/區間查詢；需另存 `amount_value`。
- **沒有唯一鍵**：每天重複資料會爆量。
- **直接讓前端打政府網站**：會遇到 CORS、速度慢、不可控。
- **排程只抓「今天」**：漏跑就永久遺失；建議抓最近 7 天窗口。

---

### 9) 第一版你可以接受的「最小可用」定義（MVP Backend）

只要做到以下 5 件事，就已經是可上線的 v1：

- 每天固定時間自動抓資料。
- 解析成功率 > 95%。
- D1 能查最近 30 天資料。
- 前端列表頁改用後端 API。
- 失敗時 logs 能看到錯誤原因。

---

### 10) 下一步我建議你怎麼做

如果你同意，我下一輪可以直接幫你產出：

1. `worker/` 完整專案骨架（Hono + D1 + Cron）。
2. `migrations/0001_init.sql`。
3. `parseTenderTable` 範本（先用假 HTML 測）。
4. 前端 `api.ts` 與 `App.tsx` 接線範例。

你只要把「實際 HTML 範例」貼上來，我就能把 parser 調到可直接跑。



### 11) 你問的關鍵：前端專案要怎麼改？後端放哪裡？要不要開新 repo？

先說結論（給你快速決策）：

- **短期最建議**：先用**同一個 repo（Monorepo）**，在根目錄新增 `worker/` 放後端程式。
- **目前不一定要**開第二個 repo。
- 等功能穩定、團隊變大，再考慮拆成前後端兩個 repo。

#### 為什麼初期用同 repo 比較好

1. 你現在已經有前端 repo，直接擴充最快。
2. 前後端欄位（TypeScript 型別）比較容易一起改，不容易對不起來。
3. Cloudflare Pages + Workers 可以從同 repo 各自設部署設定。
4. 你是非專職工程背景，維運一個 repo 壓力明顯比較低。

#### 建議的資料夾結構（直接照這個做）

```text
TenderGo-Taiwan/
├─ src/                     # 既有前端
├─ public/
├─ package.json             # 前端依賴
├─ README.md
├─ worker/                  # 新增：後端 crawler + API
│  ├─ src/
│  │  ├─ index.ts           # Worker 入口（API + scheduled）
│  │  ├─ crawler/
│  │  │  ├─ fetchTenderHtml.ts
│  │  │  └─ parseTenderTable.ts
│  │  ├─ db/
│  │  │  ├─ schema.ts
│  │  │  └─ tenderRepo.ts
│  │  └─ routes/
│  │     └─ tenders.ts
│  ├─ migrations/
│  │  └─ 0001_init.sql
│  ├─ wrangler.toml
│  └─ package.json          # 後端依賴（hono/zod/linkedom）
└─ .github/workflows/       # 可選：CI
```

#### 這個前端 repo 你現在要做的「最小修改清單」

1. 在根目錄建立 `worker/` 子專案。
2. 前端新增 `src/services/api.ts`，集中呼叫 Worker API。
3. `src/App.tsx` 改為從 API 取資料（先保留 mock 當 fallback 也可）。
4. `src/types/tender.ts` 與後端輸出欄位對齊。
5. `README` 新增本機啟動方式（前端、後端各一個指令）。

#### 什麼時候才需要拆成兩個 repo？

建議出現以下任一情況再拆：

- 前後端已是不同人員長期分工。
- 後端有獨立版本節奏／權限控管需求。
- 需要不同的 release 審核流程。
- 單一 repo 讓 CI/CD 太慢或衝突太多。

#### 你目前的最佳路線（務實版）

- **現在（1~2 週）**：同 repo 完成 Worker + D1 + 每日排程。
- **下個階段**：前端全面改接 API，mock 只保留開發用途。
- **之後（有團隊/流量）**：再評估拆 repo，不要一開始過度工程化。



### 12) 給 AI Studio 直接用的「完整 Prompt」：一鍵生成後端骨架

下面這段你可以**完整複製貼上**到 AI Studio（或任何程式碼助理）直接生成程式碼。

```prompt
你是一位資深 TypeScript / Cloudflare Workers 架構師。
請在既有前端專案中，建立一個可部署的後端子專案 `worker/`，用途是：
- 每日定時抓取政府標案查詢頁（HTML）
- 解析 table 為結構化資料
- 寫入 Cloudflare D1
- 提供前端查詢 API

# 專案背景
- 現有 repo 是 React + TypeScript 前端（Cloudflare Pages）
- 後端要放在同一個 repo 的 `worker/` 目錄（monorepo）
- 後端採用 Cloudflare Workers + D1
- 每日低頻排程（每日一次）
- 前端後續會改成打後端 API，不再直接讀政府網站

# 你要輸出的內容（務必完整）
1) 先輸出「最終目錄樹」
2) 逐檔案輸出完整程式碼（不可省略）
3) 輸出 migration SQL
4) 輸出 wrangler.toml
5) 輸出本機開發與部署指令
6) 輸出如何驗證 API 與排程

# 技術要求
- 語言：TypeScript
- Runtime：Cloudflare Workers
- Router：hono
- Validation：zod
- HTML parsing：linkedom
- DB：Cloudflare D1
- 不要使用 Node 專屬 API（要相容 Workers）

# 請建立以下檔案（完整內容）
worker/
  package.json
  tsconfig.json
  wrangler.toml
  README.md
  src/
    index.ts
    config.ts
    types.ts
    routes/
      health.ts
      tenders.ts
    crawler/
      fetchTenderHtml.ts
      parseTenderTable.ts
      buildSearchUrl.ts
    services/
      crawlAndStore.ts
    db/
      client.ts
      tenderRepo.ts
      mapper.ts
    utils/
      date.ts
      hash.ts
      logger.ts
  migrations/
    0001_init.sql

# DB Schema 要求
- table: tenders
  - id INTEGER PK AUTOINCREMENT
  - tender_id TEXT NOT NULL
  - title TEXT
  - agency TEXT
  - amount_text TEXT
  - amount_value INTEGER
  - tender_type TEXT
  - start_date TEXT
  - end_date TEXT
  - source_url TEXT NOT NULL
  - source_hash TEXT NOT NULL
  - fetched_date TEXT NOT NULL   -- yyyy-mm-dd
  - created_at TEXT DEFAULT CURRENT_TIMESTAMP（程式寫入時採 Asia/Taipei）
- unique index: (tender_id, fetched_date)
- index: agency
- index: end_date

# API 規格
- GET /api/health
  - 回傳 { ok: true, service: "tendergo-worker", nowTaipei: "YYYY-MM-DD HH:mm:ss", todayTaipei: "YYYY-MM-DD" }
- GET /api/tenders?date=YYYY-MM-DD&page=1&pageSize=20&agency=&keyword=
  - 支援分頁
  - 支援 agency/keyword 條件
  - 回傳 { items, pagination }
- GET /api/tenders/:tenderId?date=YYYY-MM-DD
  - 回傳單筆（同 tender_id 同一天）

# 排程規格
- Worker `scheduled` 每日執行一次
- 以「今天往前 6 天到今天」組查詢參數
- 呼叫 crawlAndStore
- 記錄新增筆數、略過筆數、錯誤數

# 爬蟲規格（重要）
- 函式切分：
  - fetchTenderHtml(url): Promise<string>
  - parseTenderTable(html): ParsedTender[]
- parseTenderTable 要做：
  - 容忍欄位名稱小變動（用表頭文字對映，不要寫死欄位 index）
  - 去除多餘空白
  - 金額文字轉 amount_value（無法解析可為 null）
- 每列產生 source_hash（可用 sha1/sha256）

# 寫入策略
- INSERT OR IGNORE（避免同日重複）
- 所有 SQL 用 prepared statements
- 回傳本次 run 統計：inserted / ignored / failed

# 錯誤處理
- API 錯誤回傳統一格式：{ ok:false, code, message }
- crawler 失敗不可讓整批中斷（單筆失敗要累計 failed）
- 日誌要有 request id / run id

# 程式碼品質要求
- 每個檔案加上必要註解（給初學者看得懂）
- 不要留 TODO
- 不要省略 import
- 不要使用 any（必要時用 unknown + zod refine）
- 產出可直接 `npm install && npm run dev` 的版本

# 測試與驗證（請也輸出）
- 提供 curl 範例：
  - health
  - tenders list
  - tenders detail
- 提供本機手動觸發 crawl 的方法（例如加一個 /api/admin/run-crawl?token=...）
- 說明如何在 wrangler logs 觀察 scheduled 執行

# 最後輸出格式要求
A. 先給目錄樹
B. 再按檔案路徑逐一給完整程式碼
C. 再給 migration 執行指令
D. 再給部署指令
E. 最後給「前端要改哪些檔案」清單（只列清單，不改前端程式碼）
```

#### 怎麼使用這段 Prompt（一步一步）

1. 先把上面整段貼到 AI Studio。
2. 如果輸出被截斷，回覆它：`請從上一個中斷檔案繼續，直到全部檔案完成。`
3. 請 AI Studio 每次只產出 5~8 個檔案，避免漏碼。
4. 你拿到程式後，先只建立 `worker/`，不要一次改前端。
5. 我可以再幫你逐檔審查，確保可部署。

#### 為什麼這個 Prompt 有效

- 已明確指定**目錄、檔名、技術棧、API 規格、錯誤格式、排程規格**，可降低 AI 自由發揮造成的偏差。
- 已加入「不可省略程式碼、不可 any、要 Workers 相容」等約束，能提高一次生成成功率。
- 已要求輸出部署與驗證指令，避免只有程式碼卻不知道怎麼跑。


## ✅ 目前整合狀態（2026-05-12）

### 現況判斷
- **後端 Worker 已具備雛形**：已有健康檢查、標案列表、標案明細、手動觸發爬蟲 API。  
- **資料層已具備雛形**：已有 D1 migration 與 repository/DB client 實作。  
- **前端尚未完成 API 整合**：目前 `App.tsx` 仍使用 `MOCK_TENDERS`，尚未改為呼叫 `/api/tenders`。

### 現在能不能用？
- **可以用於「介面展示」與「後端單獨驗證」**。
- **尚未達到「前後端完整串接可上線」**，因為前端資料來源仍是 mock。

### 要變成可用版，最少要完成這些
1. 在前端新增 API service（例如 `src/services/api.ts`）並把 `MOCK_TENDERS` 替換為後端回傳資料。
2. 對齊前後端欄位（如 `id/tender_id`、日期格式、金額欄位）。
3. 設定 `.env` 的 API base URL，確認 CORS 與部署網域。
4. 完成 D1 遠端 migration、`ADMIN_RUN_TOKEN` secret、Worker deploy。
5. 先手動跑一次 `/api/admin/run-crawl`，再用 `/api/tenders` 驗證有資料。

### 一鍵驗證順序（建議）
```bash
# 1) 後端健康檢查
curl "https://<worker-name>.workers.dev/api/health"

# 2) 手動觸發爬蟲
curl "https://<worker-name>.workers.dev/api/admin/run-crawl?token=<ADMIN_RUN_TOKEN>"

# 3) 查詢資料
curl "https://<worker-name>.workers.dev/api/tenders?page=1&pageSize=5"

# 4) 前端改接 API 後再啟動
npm run dev
```

> 如果第 3 步有回傳 `items`，代表後端資料流 OK；接著只剩前端資料綁定與欄位映射。
