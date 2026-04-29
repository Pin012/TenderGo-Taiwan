/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, ListFilter, User, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: 'search', label: '搜尋', icon: Search },
    { id: 'tracking', label: '追蹤', icon: ListFilter },
    { id: 'profile', label: '我的', icon: User },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#f7fafc] border-t border-[#edf2f7] px-2 py-2 z-50 h-[70px]">
      <div className="max-w-md mx-auto flex justify-around items-center h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all duration-300 ${
                isActive ? 'text-[#003366] scale-110' : 'text-[#a0aec0]'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
