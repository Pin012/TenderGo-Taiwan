# 🇹🇼 台標通 TenderGo - 政府標案查詢手機 Web App (MVP)

![TenderGo Banner](https://img.shields.io/badge/Status-MVP-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

「台標通 TenderGo」是一個專為工程顧問公司、商務開發者設計的政府標案查詢 App 雛形。透過手機優先 (Mobile-First) 的介面設計，將繁瑣的政府採購網資訊轉化為易於閱讀與追蹤的數位工具。

## 🌟 核心理念
政府標案資訊往往分散且難以在行動端閱讀。「台標通」的目標是將資料結構化，並透過進階篩選與即時通知，協助專業人士不漏接任何一個關鍵商機。

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
  - 本階段使用 `mockData` 模擬。
  - 資料結構參考 [openfunltd/pcc.g0v.ronny.tw](https://github.com/openfunltd/pcc.g0v.ronny.tw) 開源專案。

## 🚀 快速上手 (Development)

### 在 Google AI Studio 環境
1. 點擊 **Preview** 即可在右側視窗查看即時 App 效果。
2. 修改 `src/data/mockTenders.ts` 即可更新標案資料內容。

### 在本機開發環境
```bash
# 安裝依賴
npm install

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
