/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tender } from '../types/tender';

export const MOCK_TENDERS: Tender[] = [
  {
    id: '1130425-A1',
    title: '113年度資訊系統維護與資安防禦強化採案',
    orgName: '內政部資訊中心',
    budget: 5800000,
    publishDate: '2024-04-20',
    endDate: '2024-05-15',
    status: '招標中',
    type: '公開招標',
    category: '勞務類',
    location: '台北市',
    description: '本案旨在提供機關內部系統之日常運作維護，並針對近年資安威脅進行防禦硬體與軟體之升級規劃。'
  },
  {
    id: 'TP-2024-088',
    title: '台北市大安區民權東路路面整修工程',
    orgName: '台北市政府工務局新建工程處',
    budget: 12500000,
    publishDate: '2024-04-18',
    endDate: '2024-05-02',
    status: '招標中',
    type: '公開招標',
    category: '工程類',
    location: '台北市',
    description: '主要工程項目包含路面銑鋪、人行道更新、排水溝清淤及標線重新劃設。'
  },
  {
    id: 'KS-BUILD-001',
    title: '高雄市數位轉型諮詢委託服務',
    orgName: '高雄市政府經濟發展局',
    budget: 2200000,
    publishDate: '2024-04-10',
    endDate: '2024-04-25',
    status: '決標',
    type: '限制性招標',
    category: '勞務類',
    location: '高雄市',
    description: '針對高雄在地中小企業提供自動化、數位化之轉型診斷與規劃建議。'
  },
  {
    id: 'EDU-113-09',
    title: '國立台灣大學圖書館自動化系統汰換計畫',
    orgName: '國立臺灣大學',
    budget: 8900000,
    publishDate: '2024-03-30',
    endDate: '2024-04-15',
    status: '流標',
    type: '公開招標',
    category: '財物類',
    location: '台北市',
    description: '包含舊有資料庫轉檔、新型圖書管理系統導入及維運訓練。'
  },
  {
    id: 'PH-2024-XP',
    title: '澎湖縣文化局演藝廳更新二期',
    orgName: '澎湖縣政府',
    budget: 45000000,
    publishDate: '2024-04-22',
    endDate: '2024-05-20',
    status: '招標中',
    type: '選擇性招標',
    category: '工程類',
    location: '澎湖縣',
    description: '演藝廳舞台燈光及音響設備之現代化升級，含結構補強工程。'
  }
];
