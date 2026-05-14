/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, type ReactNode } from 'react';
import SearchHeader from './components/SearchHeader';
import BottomNav from './components/BottomNav';
import TenderCard from './components/TenderCard';
import TenderDetail from './components/TenderDetail';
import FilterOverlay from './components/FilterOverlay';
import { MOCK_TENDERS } from './data/mockTenders';
import { Tender } from './types/tender';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, ClipboardList, Bell, Loader2, X, Newspaper, GraduationCap, Bot, ArrowRight, UserRound, LogIn, MessageCircleQuestion, LifeBuoy, Share2 } from 'lucide-react';



type InstallPromptPlatform = 'ios' | 'android';

const INSTALL_PROMPT_KEY = 'install_prompt_state';
const INSTALL_PROMPT_DELAY_MS = 8000;
const INSTALL_PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const INSTALL_PROMPT_MAX_SHOWS = 3;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
console.log('API_BASE_URL =', API_BASE_URL);
const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

function getTodayInTaipei(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = parts.find((x) => x.type === 'year')?.value ?? '1970';
  const m = parts.find((x) => x.type === 'month')?.value ?? '01';
  const d = parts.find((x) => x.type === 'day')?.value ?? '01';
  return `${y}-${m}-${d}`;
}


function detectInstallPromptPlatform(): InstallPromptPlatform | null {
  if (typeof window === 'undefined') return null;
  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  if (isIos) return 'ios';
  if (isAndroid) return 'android';
  return null;
}

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches;
}

const EXPLORE_SECTIONS = [
  { title: '顧問專欄', description: '掌握最新標案策略與顧問實戰解析。', icon: ClipboardList },
  { title: '產業新聞', description: '追蹤公共工程、數位轉型與採購趨勢新聞。', icon: Newspaper },
  { title: '培訓課程', description: '精選採購法、提案撰寫與簡報技巧課程。', icon: GraduationCap },
  { title: 'AI諮詢', description: '用 AI 協助你快速評估標案切入機會。', icon: Bot },
];

export default function App() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('今日標案');
  const [savedDefaultButtonName, setSavedDefaultButtonName] = useState<string | null>(() => localStorage.getItem('saved_default_button_name'));
  const [advancedFilters, setAdvancedFilters] = useState({ keyword: '', orgName: '', tenderId: '', minBudget: '', maxBudget: '' });
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('api');
  const [settingsPanel, setSettingsPanel] = useState<'login' | 'profile' | null>(null);

  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('notification_enabled');
    return saved ? JSON.parse(saved) : true;
  });

  const [notifications, setNotifications] = useState<string[]>(() => {
    const saved = localStorage.getItem('notification_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [showNotificationList, setShowNotificationList] = useState(false);
  const [installPromptPlatform, setInstallPromptPlatform] = useState<InstallPromptPlatform | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    localStorage.setItem('notification_enabled', JSON.stringify(notificationEnabled));
  }, [notificationEnabled]);

  useEffect(() => {
    localStorage.setItem('notification_list', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (savedDefaultButtonName) {
      setActiveQuickFilter(savedDefaultButtonName);
    }
  }, [savedDefaultButtonName]);


  useEffect(() => {
    const platform = detectInstallPromptPlatform();
    if (!platform || !isMobileViewport()) return;

    let persisted: { disabledForever?: boolean; shownCount?: number; lastShownAt?: number } = {};
    try {
      const raw = localStorage.getItem(INSTALL_PROMPT_KEY);
      persisted = raw ? JSON.parse(raw) : {};
    } catch {
      persisted = {};
    }

    if (persisted.disabledForever) return;

    const shownCount = persisted.shownCount ?? 0;
    if (shownCount >= INSTALL_PROMPT_MAX_SHOWS) return;

    const now = Date.now();
    const lastShownAt = persisted.lastShownAt ?? 0;
    if (lastShownAt > 0 && now - lastShownAt < INSTALL_PROMPT_COOLDOWN_MS) return;

    const timer = window.setTimeout(() => {
      setInstallPromptPlatform(platform);
      setShowInstallPrompt(true);
      localStorage.setItem(
        INSTALL_PROMPT_KEY,
        JSON.stringify({
          ...persisted,
          shownCount: shownCount + 1,
          lastShownAt: Date.now(),
        }),
      );
    }, INSTALL_PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const dismissInstallPrompt = (disableForever = false) => {
    setShowInstallPrompt(false);
    if (!disableForever) return;
    try {
      const raw = localStorage.getItem(INSTALL_PROMPT_KEY);
      const persisted = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        INSTALL_PROMPT_KEY,
        JSON.stringify({
          ...persisted,
          disabledForever: true,
        }),
      );
    } catch {
      localStorage.setItem(INSTALL_PROMPT_KEY, JSON.stringify({ disabledForever: true }));
    }
  };

  // Persistence Logic: Load from localStorage on init
  const [trackingIds, setTrackingIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('tender_tracking_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error('Failed to load tracking IDs:', e);
      return new Set();
    }
  });

  // Persistence Logic: Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('tender_tracking_ids', JSON.stringify(Array.from(trackingIds)));
  }, [trackingIds]);

  // Simulate initial data fetch
  useEffect(() => {
    let isMounted = true;

    const fetchTenders = async () => {
      try {
        const today = getTodayInTaipei();
        const response = await fetch(`${API_BASE_URL}/api/tenders?date=${today}&page=1&pageSize=100`);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        const data = await response.json() as { items?: Array<Record<string, unknown>> };
        const items = Array.isArray(data.items) ? data.items : [];
        const mapped = items.map(mapApiTenderToUiTender).filter((item): item is Tender => item !== null);
        if (isMounted) {
          setTenders(mapped);
          setDataSource('api');
        }
      } catch (error) {
        console.warn('Tender API unavailable:', error);
        if (!isMounted) return;

        if (ENABLE_MOCK_FALLBACK) {
          setTenders(MOCK_TENDERS);
          setDataSource('mock');
        } else {
          setTenders([]);
          setDataSource('api');
        }
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };

    fetchTenders();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTenders = useMemo(() => {
    const now = new Date(getTodayInTaipei());

    return tenders.filter((tender) => {
      const search = searchQuery.toLowerCase();
      const advancedKeyword = advancedFilters.keyword.toLowerCase();
      const org = advancedFilters.orgName.toLowerCase();
      const idKeyword = advancedFilters.tenderId.toLowerCase();
      const matchesKeyword = tender.title.toLowerCase().includes(search) && tender.title.toLowerCase().includes(advancedKeyword);
      if (!matchesKeyword) return false;
      if (org && !tender.orgName.toLowerCase().includes(org)) return false;
      if (idKeyword && !tender.id.toLowerCase().includes(idKeyword)) return false;
      if (advancedFilters.minBudget && tender.budget < Number(advancedFilters.minBudget)) return false;
      if (advancedFilters.maxBudget && tender.budget > Number(advancedFilters.maxBudget)) return false;

      if (activeQuickFilter === '今日標案' || activeQuickFilter === savedDefaultButtonName) {
        return tender.publishDate === getTodayInTaipei();
      }

      if (activeQuickFilter === '近期截止') {
        const endDate = new Date(tender.endDate);
        const diffDays = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 14 && tender.status === '招標中';
      }

      return true;
    });
  }, [searchQuery, activeQuickFilter, tenders, advancedFilters, savedDefaultButtonName]);

  const trackedTenders = useMemo(() => {
    return tenders.filter(tender => trackingIds.has(tender.id));
  }, [trackingIds, tenders]);

  const handleTrack = (id: string) => {
    setTrackingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#003366] flex flex-col items-center justify-center text-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center backdrop-blur-md border border-white/20">
            <Loader2 className="animate-spin text-white" size={40} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight mb-2">標案通 TenderGo</h1>
            <p className="text-white/60 text-xs font-mono uppercase tracking-widest">Initialising Database...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <div className="max-w-md mx-auto min-h-screen shadow-xl bg-white flex flex-col relative overflow-hidden pb-20">
        {activeTab === 'search' && (
          <SearchHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onFilterClick={() => setIsFilterOpen(true)}
            activeFilterCount={0}
            activeQuickFilter={activeQuickFilter}
            onQuickFilterChange={setActiveQuickFilter}
            customDefaultFilterName={savedDefaultButtonName}
          />
        )}

        {activeTab === 'search' && (
          <div className="px-4 pt-3 text-xs text-slate-500">
            目前資料來源：{dataSource === 'api' ? 'DATABASE' : '前端 mock（API 失敗時 fallback）'}
          </div>
        )}

        {activeTab === 'tracking' && (
          <header className="sticky top-0 z-40 bg-[#003366] text-white px-4 py-5 font-bold text-lg flex items-center justify-between shadow-md">
            <span>我的追蹤標案</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowNotificationList(true)} className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Bell size={18} />
                {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] rounded-full bg-orange-500 text-white flex items-center justify-center">{notifications.length > 9 ? '9+' : notifications.length}</span>}
              </button>
              <span className="text-xs bg-white text-[#003366] px-3 py-1 rounded-full font-bold">{trackingIds.size}</span>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto px-4 py-4 bg-[#f0f4f8]">
          <AnimatePresence mode="wait">
            {activeTab === 'search' && (
              <motion.div key="search-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                {filteredTenders.length > 0 ? filteredTenders.map(tender => (
                  <TenderCard key={tender.id} tender={tender} onClick={() => setSelectedTender(tender)} onTrack={() => handleTrack(tender.id)} isTracking={trackingIds.has(tender.id)} />
                )) : (
                  <div className="text-center py-20 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm"><LayoutGrid size={32} /></div>
                    <p className="text-slate-400 text-sm font-medium">找不到符合條件的標案</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tracking' && (
              <motion.div key="tracking-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                {trackedTenders.length > 0 ? trackedTenders.map(tender => (
                  <TenderCard key={tender.id} tender={tender} onClick={() => setSelectedTender(tender)} onTrack={() => handleTrack(tender.id)} isTracking={true} />
                )) : (
                  <div className="text-center py-20 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-[#003366]/20 shadow-sm"><ClipboardList size={32} /></div>
                    <p className="text-slate-400 text-sm font-medium">尚未加入任何追蹤標案</p>
                    <button onClick={() => setActiveTab('search')} className="text-[#003366] font-bold text-sm hover:underline">去逛逛標案</button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'explore' && (
              <motion.div key="explore-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-2 space-y-4">
                {EXPLORE_SECTIONS.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#003366]">{title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{description}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#003366]/10 text-[#003366] flex items-center justify-center"><Icon size={18} /></div>
                    </div>
                    <button className="mt-3 text-[#003366] text-sm font-semibold inline-flex items-center gap-1">查看內容 <ArrowRight size={14} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-6 space-y-8 max-w-md mx-auto">
                <div className="space-y-4">
                  <MenuHeading>系統功能</MenuHeading>
                  <MenuItem icon={Bell} label="推播通知" badge={notificationEnabled ? '已開啟' : '已關閉'} onClick={() => setNotificationEnabled((v) => !v)} />
                  <MenuItem icon={LogIn} label="登入" onClick={() => setSettingsPanel('login')} />
                  <MenuItem icon={UserRound} label="個人資訊" onClick={() => setSettingsPanel('profile')} />
                  <MenuItem icon={MessageCircleQuestion} label="意見回饋" />
                  <MenuItem icon={LifeBuoy} label="幫助中心" />

                  <MenuHeading>關於 App</MenuHeading>
                  <div className="bg-[#003366] p-5 rounded-[24px] text-white/90 shadow-lg shadow-blue-900/10">
                    <h4 className="text-sm font-bold mb-2">標案通 TenderGo v0.1.0</h4>
                    <p className="text-xs text-white/70 leading-relaxed">TenderGo 會依照你的搜尋與追蹤偏好，提供最適切的標案推薦與提醒，協助你更快掌握關鍵商機。</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <TenderDetail tender={selectedTender} onClose={() => setSelectedTender(null)} onTrack={() => handleTrack(selectedTender?.id || '')} isTracking={trackingIds.has(selectedTender?.id || '')} />

        <FilterOverlay
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={advancedFilters}
          onChange={setAdvancedFilters}
          onDeleteCondition={() => setAdvancedFilters({ keyword: '', orgName: '', tenderId: '', minBudget: '', maxBudget: '' })}
          onSetCondition={(name) => setActiveQuickFilter(name)}
          onSetDefault={(name) => {
            localStorage.setItem('saved_default_button_name', name);
            setSavedDefaultButtonName(name);
            setActiveQuickFilter(name);
          }}
        />

        <AnimatePresence>
          {showNotificationList && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowNotificationList(false)}>
              <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className="max-w-md mx-auto bg-white rounded-3xl p-5 h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#003366]">通知列表</h3>
                  <button className="text-sm text-slate-500" onClick={() => setNotifications([])}>清空全部</button>
                </div>
                {notifications.length === 0 ? <p className="text-sm text-slate-400 text-center py-16">目前沒有通知</p> : (
                  <div className="space-y-3">
                    {notifications.map((msg, idx) => (
                      <div key={`${msg}-${idx}`} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-700">{msg}</div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence>
          {showInstallPrompt && installPromptPlatform && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed bottom-24 left-1/2 z-[125] w-[92%] max-w-sm -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-[#003366]/10 p-2 text-[#003366]">
                  <Share2 size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">把 TenderGo 加到主畫面</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {installPromptPlatform === 'ios'
                      ? 'Safari 右下角點「分享」，再選「加入主畫面」，下次可像 App 一樣一鍵開啟。'
                      : 'Chrome 右上角點「⋮」選單，再點「加到主畫面」即可快速開啟 TenderGo。'}
                  </p>
                </div>
                <button className="text-slate-400" onClick={() => dismissInstallPrompt(false)} aria-label="關閉提示">
                  <X size={16} />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button onClick={() => dismissInstallPrompt(true)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100">不再顯示</button>
                <button onClick={() => dismissInstallPrompt(false)} className="rounded-lg bg-[#003366] px-3 py-1.5 text-xs font-semibold text-white">我知道了</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {settingsPanel && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130] bg-black/40 backdrop-blur-sm p-4" onClick={() => setSettingsPanel(null)}>
              <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className="max-w-md mx-auto bg-white rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-[#003366] mb-4">{settingsPanel === 'login' ? '登入' : '個人資訊'}</h3>
                {settingsPanel === 'login' ? (
                  <div className="space-y-3">
                    <input type="email" placeholder="電子郵件" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none" />
                    <input type="password" placeholder="密碼" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none" />
                    <button className="w-full py-3 rounded-xl bg-[#003366] text-white font-semibold">登入</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input type="text" placeholder="姓名" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none" />
                    <input type="text" placeholder="公司名稱" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none" />
                    <input type="tel" placeholder="聯絡電話" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none" />
                    <button className="w-full py-3 rounded-xl bg-[#003366] text-white font-semibold">儲存資料</button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function mapApiTenderToUiTender(item: Record<string, unknown>): Tender | null {
  const tenderId = typeof item.tender_id === 'string' ? item.tender_id : null;
  if (!tenderId) return null;

  const title = typeof item.title === 'string' && item.title.trim() ? item.title : '（無標題）';
  const orgName = typeof item.agency === 'string' && item.agency.trim() ? item.agency : '（未提供機關）';
  const budget = typeof item.amount_value === 'number' ? item.amount_value : 0;
  const publishDate = typeof item.start_date === 'string' && item.start_date ? item.start_date : '1970-01-01';
  const endDate = typeof item.end_date === 'string' && item.end_date ? item.end_date : publishDate;
  const type = typeof item.bidding_method === 'string' && item.bidding_method.trim() ? item.bidding_method : '未分類';
  const status = normalizeStatus(item.award_status);

  return {
    id: tenderId,
    title,
    orgName,
    budget,
    publishDate,
    endDate,
    status,
    type,
    category: '未分類',
    location: '全台',
    description: undefined,
  };
}

function normalizeStatus(raw: unknown): Tender['status'] {
  if (typeof raw !== 'string') return '待追蹤';
  if (raw.includes('決標')) return '決標';
  if (raw.includes('流標')) return '流標';
  if (raw.includes('廢標')) return '廢標';
  if (raw.includes('招標')) return '招標中';
  return '待追蹤';
}

function MenuHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">{children}</h3>;
}

function MenuItem({ icon: Icon, label, badge, onClick }: { icon: any, label: string, badge?: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm">
      <div className="text-slate-400"><Icon size={20} /></div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {badge && <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}
