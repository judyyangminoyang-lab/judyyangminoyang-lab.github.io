import { useState } from "react";
import { motion } from "motion/react";
import { 
  Home, 
  TrendingUp, 
  Map, 
  Activity, 
  Lightbulb, 
  Bell, 
  HelpCircle, 
  Shield, 
  Users, 
  Database, 
  Wrench, 
  ClipboardList, 
  FileSpreadsheet, 
  LogOut,
  RefreshCw,
  UserCheck,
  MessageSquare
} from "lucide-react";
import { User, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

interface SidebarProps {
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lastUpdateTime: string;
  onRefresh: () => void;
  currentUser: User | null;
  userRole: 'admin' | 'staff' | 'guest';
  onCloseMobile?: () => void;
}

export default function Sidebar({
  isAdminMode,
  setIsAdminMode,
  activeTab,
  setActiveTab,
  lastUpdateTime,
  onRefresh,
  currentUser,
  userRole,
  onCloseMobile
}: SidebarProps) {
  
  const userTabs = [
    { id: "home", label: "首頁", icon: Home },
    { id: "trends", label: "人流趨勢", icon: TrendingUp },
    { id: "equipments", label: "故障器材", icon: Activity },
    { id: "smart-tip", label: "Smart Tip", icon: Lightbulb },
    { id: "feedback", label: "意見回報區", icon: MessageSquare },
    { id: "announcements", label: "公告資訊", icon: Bell },
    { id: "faq", label: "常見問題", icon: HelpCircle },
  ];

  const adminTabs = [
    { id: "admin-home", label: "後台儀表板", icon: Shield },
    { id: "admin-occupancy", label: "人數管理", icon: Users },
    { id: "admin-equipments", label: "故障器材管理", icon: Wrench },
    { id: "admin-announcements", label: "公告資訊管理", icon: Bell },
    { id: "admin-logs", label: "操作紀錄", icon: ClipboardList },
    ...(userRole === 'admin' ? [{ id: "admin-staff", label: "工讀生權限指派", icon: UserCheck }] : []),
    { id: "admin-reports", label: "報表與分析", icon: FileSpreadsheet },
  ];

  const currentTabs = isAdminMode ? adminTabs : userTabs;

  const [signInError, setSignInError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setSignInError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Failed Google log-in:", err);
      let errorMsg = err.message || String(err);
      if (err.code === "auth/operation-not-allowed") {
        errorMsg = "Firebase 尚未啟用 Google 登入方式。請至 Firebase Console 的 Authentication > Sign-in method 啟用 Google 登入方式。";
      } else if (err.code === "auth/popup-blocked") {
        errorMsg = "登入彈出視窗被瀏覽器阻擋，請在瀏覽器網址列允許此網頁的彈出視窗，並再試一次。";
      } else if (err.code === "auth/popup-closed-by-user") {
        errorMsg = "登入視窗被手動關閉，請重新點選登入。";
      } else if (window.self !== window.top) {
        errorMsg = "因安全與 Cookie 限制，在 AI 預覽框 (iframe) 中無法完成彈出式 Google 授權。請點擊上方新分頁開啟按鈕或下方連結以新分頁開啟重新登入。";
      }
      setSignInError(errorMsg);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAdminMode(false);
      setActiveTab("home");
      onCloseMobile?.();
    } catch (err) {
      console.error("Failed log-out:", err);
    }
  };

  return (
    <aside className="w-full lg:w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200 shrink-0 h-full overflow-y-auto select-none">
      {/* Gym Title / Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
        <div className="bg-purple-600 text-white p-2 rounded-xl flex items-center justify-center shadow-lg shadow-purple-100">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg tracking-tight text-slate-950">中大健身房</h1>
          <p className="font-mono text-[11px] text-slate-400">即時人數監測系統</p>
        </div>
      </div>

      {/* Role Selector / Toggle Station */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-2">切換系統視角</div>
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg gap-1 border border-slate-200">
          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab("home");
              onCloseMobile?.();
            }}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              !isAdminMode 
                ? "bg-purple-600 text-white shadow-sm" 
                : "text-slate-550 hover:text-slate-800 hover:bg-slate-200/40"
            }`}
          >
            <span>一般前端</span>
          </button>
          <button
            onClick={async () => {
              if (!currentUser) {
                alert("進入工讀後台前，請使用系統下方 Google 帳號登入！");
              } else {
                setIsAdminMode(true);
                setActiveTab("admin-home");
                onCloseMobile?.();
              }
            }}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              isAdminMode 
                ? "bg-purple-600 text-white shadow-sm" 
                : "text-slate-550 hover:text-slate-800 hover:bg-slate-200/40"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 mr-0.5" />
            <span>工讀後台</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
          {isAdminMode ? "工讀生管理功能" : "主要功能選單"}
        </div>
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative group cursor-pointer ${
                isActive 
                  ? "bg-yellow-50/70 text-yellow-800 font-semibold border-r-4 border-yellow-550 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="indicator" 
                  className="absolute left-0 w-1.5 h-6 bg-yellow-500 rounded-r-md"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-yellow-600" : "text-slate-400 group-hover:text-slate-650"}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Auth Panel segment */}
      <div className="border-t border-slate-100 p-3 bg-slate-50/40">
        {!currentUser ? (
          <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
            <p className="text-xs font-bold text-slate-700 mb-2.5">後台管理/值班工讀登入</p>

            {signInError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-700 text-left text-[11px] leading-relaxed">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <span>⚠️ 登入失敗原因：</span>
                </p>
                <p className="font-medium text-slate-700">{signInError}</p>
                <button 
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="mt-2 text-xs font-bold font-sans text-purple-700 hover:text-purple-800 underline block cursor-pointer"
                >
                  👉 點此在「獨立新分頁」開啟本網頁
                </button>
              </div>
            )}

            <button
              onClick={handleSignIn}
              className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-100 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.45 1.625l2.437-2.437C17.312 1.596 14.93.9 12.24.9 6.42.9 1.7 5.62 1.7 11.4s4.72 10.5 10.54 10.5c5.58 0 10.43-3.9 10.43-10.5 0-.58-.05-1.11-.15-1.615H12.24z"/>
              </svg>
              <span>以 Google 帳號登入</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-2.5 text-left leading-relaxed">
              * 系統預設最高管理者為體育室負責教師（楊老師）。
              其餘工讀人員須先由管理者於登入後，在後台「工讀生權限指派」中登錄其信箱。
            </p>
          </div>
        ) : (
          <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col space-y-2.5 shadow-xs select-text">
            <div className="flex items-center space-x-2.5">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  className="w-9 h-9 rounded-full border border-slate-100 object-cover" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-purple-600 font-mono">
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.displayName || "Google 訪客"}</p>
                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                  <span className={`text-[9px] px-1 py-0.2 rounded-md font-bold shrink-0 ${
                    userRole === 'admin' 
                      ? "bg-yellow-500 text-gray-950 border border-yellow-600" 
                      : userRole === 'staff' 
                      ? "bg-purple-50 text-purple-600 border border-purple-150" 
                      : "bg-slate-50 text-slate-500 border border-slate-200"
                  }`}>
                    {userRole === 'admin' ? "管理員" : userRole === 'staff' ? "工讀生" : "訪客"}
                  </span>
                  {currentUser.email && (
                    <span className="text-[9px] font-mono text-slate-400 truncate max-w-[80px]" title="帳號信箱已安全遮蔽">
                      {(() => {
                        const parts = currentUser.email.split("@");
                        if (parts.length !== 2) return currentUser.email;
                        const name = parts[0];
                        const domain = parts[1];
                        if (name.length <= 3) return name.charAt(0) + "***@" + domain;
                        return name.substring(0, 2) + "***" + name.charAt(name.length - 1) + "@" + domain;
                      })()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-red-200 hover:text-red-500 text-slate-600 transition-colors rounded-xl flex items-center justify-center space-x-1.5 text-[11px] font-bold font-sans cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>變更/登出帳號</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer System Meta */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-slate-500 font-mono text-xs flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400">最後更新時間：</span>
          <button 
            onClick={onRefresh}
            title="重新整理數據" 
            className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer p-0.5 rounded hover:bg-slate-200/50"
          >
            <RefreshCw className="h-3 w-3 animate-spin-hover" />
          </button>
        </div>
        <div className="text-slate-600 text-xs text-right truncate bg-white py-1.5 px-2.5 rounded-lg border border-slate-200/60 shadow-sm">
          {lastUpdateTime}
        </div>
      </div>
    </aside>
  );
}
