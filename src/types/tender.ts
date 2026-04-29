/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TenderStatus = '招標中' | '決標' | '流標' | '廢標' | '待追蹤';

export interface Tender {
  id: string;              // 標案案號
  title: string;           // 標案名稱
  orgName: string;         // 招標機關
  budget: number;          // 預算金額
  publishDate: string;     // 公告日期
  endDate: string;         // 截止投標日期
  status: TenderStatus;    // 標案狀態
  type: string;            // 招標方式（如：公開招標）
  category: string;        // 標案類別（如：工程類、勞務類）
  location: string;        // 履約地點
  description?: string;    // 詳細說明（選填）
}
