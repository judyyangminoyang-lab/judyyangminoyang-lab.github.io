import { useState, useEffect } from "react";
import { GymStateSnapshot } from "./types";
import Sidebar from "./components/Sidebar";
import DashboardHome from "./components/DashboardHome";
import OccupancyTrends from "./components/OccupancyTrends";
import EquipmentFaults from "./components/EquipmentFaults";
import SmartTipsView from "./components/SmartTipsView";
import AnnouncementsView from "./components/AnnouncementsView";
import FAQView from "./components/FAQView";
import FeedbackBoardView from "./components/FeedbackBoardView";
import StaffConsole from "./components/StaffConsole";
import { Loader2, RefreshCw, Lock, ShieldAlert, LogOut, ArrowLeft, Menu, Users, Activity } from "lucide-react";
import { auth, db, SUPER_ADMIN_EMAIL } from "./firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { INITIAL_GYM_STATE } from "./constants";

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [state, setState] = useState<GymStateSnapshot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | 'guest'>('guest');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Authenticated State and Role Resolver (Relying ONLY on actual Google Account / Firebase Authentication)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      setCurrentUser(user);
      if (user) {
        const loweredEmail = user.email?.toLowerCase().trim() || "";
        if (loweredEmail === SUPER_ADMIN_EMAIL) {
          setUserRole('admin');
        } else {
          try {
            const staffRef = doc(db, 'staff_members', loweredEmail);
            const staffSnap = await getDoc(staffRef);
            if (staffSnap.exists()) {
              const dbRole = staffSnap.data().role;
              if (dbRole === 'admin') {
                setUserRole('admin');
              } else if (dbRole === 'staff') {
                setUserRole('staff');
              } else {
                setUserRole('guest');
              }
            } else {
              setUserRole('guest');
            }
          } catch (err) {
            console.error("Error resolving user permissions:", err);
            setUserRole('guest');
          }
        }
      } else {
        setUserRole('guest');
        setIsAdminMode(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const [isPolling, setIsPolling] = useState<boolean>(false);

  // Sync state snapshot in real-time from Firestore, with Express server fallback
  useEffect(() => {
    // Immediate initial fetch to prevent the loading screen block if Firebase is unconfigured or declined
    fetchGymState();

    const docRef = doc(db, "config", "gymState");
    const unsubscribeSnapshot = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const snapData = snap.data() as GymStateSnapshot;
        if (snapData.maxLimit !== 100) {
          snapData.maxLimit = 100;
        }
        setState(snapData);
        setIsPolling(false);
      } else {
        console.warn("Firestore state doc doesn't exist yet. Initializing default state...");
        // Auto-initialize if current user is admin/staff
        if (userRole === 'admin' || userRole === 'staff') {
          setDoc(docRef, INITIAL_GYM_STATE).catch(err => console.error("Auto firestore populate failed:", err));
        }
        setState(INITIAL_GYM_STATE);
        setIsPolling(false);
      }
    }, (error) => {
      console.warn("Firestore subscription failed, falling back to legacy polling:", error.message);
      setIsPolling(true);
      // Fallback: Fetch once from Node API
      fetchGymState();
    });

    return () => unsubscribeSnapshot();
  }, [userRole]);

  // Persistent Polling fallback when Firestore subscription fails (e.g. for unlogged-in users/isolated iframe contexts)
  useEffect(() => {
    if (!isPolling) return;
    
    // Poll every 10 seconds to maintain parity with real-time states
    const timer = setInterval(() => {
      fetchGymState();
    }, 10000);

    return () => clearInterval(timer);
  }, [isPolling]);

  const fetchGymState = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/state");
      const data = await res.json();
      if (data) {
        if (data.maxLimit !== 100) {
          data.maxLimit = 100;
        }
        setState(data);
      }
    } catch (err) {
      console.error("Failed to sync live state profile:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Synchronize state trigger
  const handleUpdateSnapshot = (newSnapshot: GymStateSnapshot) => {
    setState(newSnapshot);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAdminMode(false);
      setActiveTab("home");
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  if (!state) {
    return (
      <div className="w-screen h-screen bg-white flex flex-col justify-center items-center text-slate-800">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="font-semibold text-sm">中大健身房即時監測系統正在讀取中...</p>
        <p className="text-[11px] text-slate-400 font-mono mt-1.5">NCU Gym Monitoring Cluster Initializing with Firebase</p>
      </div>
    );
  }

  // Orchestrate active view container
  let content = null;

  if (isAdminMode) {
    const isAuthorized = userRole === 'admin' || userRole === 'staff';
    
    if (isAuthLoading) {
      content = (
        <div className="flex-1 flex flex-col justify-center items-center bg-white text-slate-600">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
          <p className="text-xs font-semibold">正在驗證您的工讀生管理權限...</p>
        </div>
      );
    } else if (!isAuthorized) {
      // Access Restriction screen for Guests trying to bypass UI
      content = (
        <div className="flex-1 flex flex-col justify-center items-center bg-white p-8 select-none">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-150 shadow-lg shadow-red-50/20 text-center animate-zoom-in">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-650 rounded-full flex items-center justify-center mb-5">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">🔒 權限不足 Access Restricted</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              您好 <span className="font-bold text-slate-800">{currentUser?.displayName || "同學"}</span>！目前您是以 <span className="text-purple-600 font-bold">一般訪客</span> 身份登入。本區域為中大體育室值勤工讀生專屬後台。
            </p>
            <div className="bg-purple-50/20 p-4 rounded-xl text-left border border-purple-100 mb-6">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                👉 <span className="font-bold text-slate-700">如何取得權限：</span><br/>
                後台工讀生之登入帳號與操作權限，需由健身房系統管理者 <span className="font-semibold text-slate-900">楊老師</span> 登入系統後，於工讀生管理功能內指派登入。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setActiveTab("home");
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回一般前端</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-2.5 px-4 bg-red-50 hover:bg-red-100/80 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span>切換帳號</span>
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // If Admin Mode and verified, we route to Staff Console showing appropriate sub-views
      content = (
        <StaffConsole 
          state={state} 
          onUpdateState={handleUpdateSnapshot} 
          activeTab={activeTab} 
          currentUser={currentUser}
          userRole={userRole}
        />
      );
    }
  } else {
    // Standard General user views
    switch (activeTab) {
      case "home":
        content = <DashboardHome state={state} onNavigate={(tabId) => setActiveTab(tabId)} />;
        break;
      case "trends":
        content = <OccupancyTrends state={state} />;
        break;
      case "equipments":
        content = <EquipmentFaults state={state} />;
        break;
      case "smart-tip":
        content = <SmartTipsView state={state} />;
        break;
      case "announcements":
        content = <AnnouncementsView state={state} />;
        break;
      case "feedback":
        content = <FeedbackBoardView state={state} onUpdateState={handleUpdateSnapshot} />;
        break;
      case "faq":
        content = <FAQView />;
        break;
      default:
        content = <DashboardHome state={state} onNavigate={(tabId) => setActiveTab(tabId)} />;
    }
  }

  return (
    <div className="w-screen h-screen flex bg-white overflow-hidden font-sans text-gray-800 relative">
      
      {/* Mobile Sidebar Back-drop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop Layout (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:shrink-0 lg:h-screen lg:w-64">
        <Sidebar 
          isAdminMode={isAdminMode} 
          setIsAdminMode={setIsAdminMode} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          lastUpdateTime={state.lastUpdateTime} 
          onRefresh={fetchGymState} 
          currentUser={currentUser}
          userRole={userRole}
        />
      </div>

      {/* Sidebar - Mobile Drawer Layer */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col h-full shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar 
          isAdminMode={isAdminMode} 
          setIsAdminMode={(adminVal) => {
            setIsAdminMode(adminVal);
            setIsMobileOpen(false);
          }} 
          activeTab={activeTab} 
          setActiveTab={(tabVal) => {
            setActiveTab(tabVal);
            setIsMobileOpen(false);
          }} 
          lastUpdateTime={state.lastUpdateTime} 
          onRefresh={fetchGymState} 
          currentUser={currentUser}
          userRole={userRole}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
      </div>

      {/* Primary Canvas Container block */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Mobile Top Header (Sticky visible only on Mobile/Tablet screens) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0 select-none">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus:outline-none cursor-pointer transition-colors"
              title="展開導覽選單"
              type="button"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <div className="flex items-center space-x-1.5">
              <div className="bg-purple-600 text-white p-1 rounded-lg shadow-sm shadow-purple-150">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h1 className="font-sans font-bold text-sm tracking-tight text-slate-950">中大健身房</h1>
                <p className="font-mono text-[9px] text-slate-400 leading-none">即時監測系統</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Realtime Capacity Gauge Badge */}
            <div className={`px-2.5 py-1 rounded-lg border text-[11.5px] font-bold font-mono tracking-tight flex items-center gap-1.5 ${
              (state.currentOccupancy / state.maxLimit) >= 0.9
                ? "bg-red-50 text-red-600 border-red-200 animate-pulse font-extrabold"
                : (state.currentOccupancy / state.maxLimit) >= 0.75
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-purple-50 text-purple-600 border-purple-150"
            }`}>
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{state.currentOccupancy} / {state.maxLimit}</span>
            </div>

            {/* Manual Update or Reset sync shortcut */}
            <button
              onClick={fetchGymState}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              title="刷新數據"
              type="button"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {isRefreshing && (
          <div className="absolute top-4 right-6 z-40 bg-white p-2 px-3 border border-gray-150 rounded-xl shadow-lg flex items-center gap-1.5 text-[10px] font-bold text-blue-600 animate-fade-in font-mono select-none">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>數據同步中...</span>
          </div>
        )}
        {content}
      </main>
    </div>
  );
}

