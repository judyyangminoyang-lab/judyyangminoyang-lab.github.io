import React, { useState, useEffect } from "react";
import { GymStateSnapshot } from "../types";
import { 
  Shield, 
  Wrench, 
  Bell, 
  X
} from "lucide-react";
import { User } from "firebase/auth";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

// Import modular subviews
import AdminHome from "./AdminHome";
import AdminOccupancy from "./AdminOccupancy";
import AdminEquipments from "./AdminEquipments";
import AdminAnnouncements from "./AdminAnnouncements";
import AdminLogs from "./AdminLogs";
import AdminReports from "./AdminReports";
import AdminStaff from "./AdminStaff";

interface StaffConsoleProps {
  state: GymStateSnapshot;
  onUpdateState: (newState: GymStateSnapshot) => void;
  activeTab: string; // The specific sub-tab within admin
  currentUser: User | null;
  userRole: 'admin' | 'staff' | 'guest';
}

export default function StaffConsole({ 
  state, 
  onUpdateState, 
  activeTab,
  currentUser,
  userRole
}: StaffConsoleProps) {
  // Global modal control states
  const [showAddEquip, setShowAddEquip] = useState<boolean>(false);
  const [showAddAnn, setShowAddAnn] = useState<boolean>(false);

  // Common modal form inputs (for global modal fallbacks triggered from Quick Action panels)
  const [newEquipId, setNewEquipId] = useState<string>("TR-");
  const [newEquipName, setNewEquipName] = useState<string>("");
  const [newEquipLoc, setNewEquipLoc] = useState<string>("重訓區");
  const [newEquipStatus, setNewEquipStatus] = useState<string>("故障中");
  const [newEquipDesc, setNewEquipDesc] = useState<string>("");
  const [newEquipEst, setNewEquipEst] = useState<string>("");

  const [announcementInput, setAnnouncementInput] = useState<string>("");

  // Staff list persistence from Firestore
  interface StaffMember {
    email: string;
    role: string;
    assignedAt: string;
    assignedBy?: string;
  }
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isStaffLoading, setIsStaffLoading] = useState<boolean>(true);

  // Operator identification resolver
  const activeOperator = currentUser?.displayName || currentUser?.email?.split("@")[0] || "系統工讀生";

  // Real-time listener for Staff Directory
  useEffect(() => {
    if (userRole !== "admin") return;
    setIsStaffLoading(true);

    const loadStaffFromBackend = async () => {
      try {
        const res = await fetch("/api/state/staff");
        const list = await res.json();
        setStaffList(list);
        setIsStaffLoading(false);
      } catch (err) {
        console.error("Failed to load staff list from backend API:", err);
        setIsStaffLoading(false);
      }
    };

    const unsubscribe = onSnapshot(collection(db, "staff_members"), (snap) => {
      const list: StaffMember[] = [];
      snap.forEach((doc) => {
        list.push({ email: doc.id, ...(doc.data() as any) });
      });
      setStaffList(list);
      setIsStaffLoading(false);
    }, (error) => {
      console.warn("Firestore staff list retrieval failed, trying Server API proxy fallback:", error);
      loadStaffFromBackend();
    });
    return () => unsubscribe();
  }, [userRole]);

  // Handler 1: Occupancy Count Counter微調
  const handleOccupancyChange = async (method: "inc" | "dec" | "set", value?: number) => {
    try {
      const res = await fetch("/api/state/occupancy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          value,
          user: activeOperator
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error("Failed to alter occupancy count:", err);
    }
  };

  // Handler 2: Region status override 覆寫區域客流狀況
  const handleRegionStatusChange = async (regionId: string, status: string) => {
    try {
      const res = await fetch("/api/state/regions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionId,
          status,
          user: activeOperator
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error("Failed to adjust region status:", err);
    }
  };

  // Handler 3: Update equipment repair status
  const handleUpdateEquipmentStatus = async (equipId: string, status: string) => {
    try {
      const res = await fetch("/api/state/equipment/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: equipId,
          status,
          user: activeOperator
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error("Failed to alter equipment status:", err);
    }
  };

  // Handler 4: Delete equipment fault record
  const handleDeleteEquipment = async (equipId: string) => {
    if (!confirm("確認要刪除或下架此設備維修異常案件嗎？")) return;
    try {
      const res = await fetch("/api/state/equipment/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: equipId, user: activeOperator })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error("Failed to delete faulty record:", err);
    }
  };

  // Handler 5: Trigger equipment add via direct parameters (Modular call)
  const onPureAddEquipment = async (
    id: string,
    name: string,
    location: string,
    status: string,
    description: string,
    estRepairDate: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/state/equipment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name,
          location,
          status,
          description,
          estRepairDate,
          user: activeOperator
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState(data.state);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to include equipment record:", err);
      return false;
    }
  };

  // Handler 6: Add announcement via custom string (Modular call)
  const onPureAddAnnouncement = async (content: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/state/announcements/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          user: activeOperator
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState(data.state);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to list new announcement:", err);
      return false;
    }
  };

  // Handler 7: Delete announcement
  const handleDeleteAnnouncement = async (annId: string) => {
    if (!confirm("確定下架此公告？此動作同時也會登記操作日誌。")) return;
    try {
      const res = await fetch("/api/state/announcements/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: annId, user: activeOperator })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState(data.state);
      }
    } catch (err) {
      console.error("Failed to prune announcement:", err);
    }
  };

  // Handler 8: Feedback replies & Moderation delete
  const handleFeedbackReply = async (feedbackId: string, text: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/state/feedback/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: feedbackId,
          reply: text,
          user: activeOperator
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState(data.state);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to submit feedback reply:", err);
      return false;
    }
  };

  const handleFeedbackDelete = async (feedbackId: string): Promise<boolean> => {
    if (!confirm("確定要刪除或下架此同學提出的意見登陸嗎？")) return false;
    try {
      const res = await fetch("/api/state/feedback/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: feedbackId,
          user: activeOperator
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateState(data.state);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to remove feedback:", err);
      return false;
    }
  };

  // Handler 9: Staff assignment
  const onPureAddStaff = async (email: string, role: string): Promise<boolean> => {
    try {
      const staffEmail = email.trim().toLowerCase();
      // Write directly to Firestore using client-side SDK so that security rules can authenticate the request.
      const docRef = doc(db, "staff_members", staffEmail);
      await setDoc(docRef, {
        role,
        assignedAt: new Date().toISOString(),
        assignedBy: currentUser?.email || "Super Admin"
      });

      // Also call backend to synchronize backend state
      try {
        await fetch("/api/state/staff/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: staffEmail,
            role,
            assignedBy: currentUser?.email || "Super Admin"
          })
        });
      } catch (backendErr) {
        console.warn("Backend state sync failed, but Firestore was updated successfully:", backendErr);
      }

      return true;
    } catch (err) {
      console.error("Failed to assign staff permissions:", err);
      alert("指派權限失敗：" + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  };

  const onPureDeleteStaff = async (email: string): Promise<void> => {
    if (!confirm(`確定要取消 ${email} 的工讀生管理權限嗎？`)) return;
    try {
      const staffEmail = email.trim().toLowerCase();
      // Delete directly from Firestore on client side
      const docRef = doc(db, "staff_members", staffEmail);
      await deleteDoc(docRef);

      // Also call backend to synchronize backend state
      try {
        await fetch("/api/state/staff/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: staffEmail })
        });
      } catch (backendErr) {
        console.warn("Backend state sync failed, but Firestore delete succeeded:", backendErr);
      }
    } catch (err) {
      console.error("Failed to revoke staff permissions:", err);
      alert("取消權限失敗：" + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Modal specific submit triggers (Internal forms inside global console modals)
  const handleAddEquipmentModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipId.trim() || !newEquipName.trim()) {
      alert("器材編號及名稱為必填項目！");
      return;
    }
    const ok = await onPureAddEquipment(
      newEquipId.trim(),
      newEquipName.trim(),
      newEquipLoc,
      newEquipStatus,
      newEquipDesc.trim() || "無特別描述",
      newEquipEst.trim() || "--"
    );
    if (ok) {
      setNewEquipId("TR-");
      setNewEquipName("");
      setNewEquipDesc("");
      setNewEquipEst("");
      setShowAddEquip(false);
    }
  };

  const handleAddAnnouncementModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementInput.trim()) return;

    const formattedContent = `【校外公告通訊】\n公告對象：全體在校生/會員\n\n${announcementInput.trim()}`;
    const ok = await onPureAddAnnouncement(formattedContent);
    if (ok) {
      setAnnouncementInput("");
      setShowAddAnn(false);
    }
  };

  // Orchestrate sub-tab display
  let activeContent = null;
  switch (activeTab) {
    case "admin-home":
      activeContent = (
        <AdminHome 
          state={state} 
          handleFeedbackReply={handleFeedbackReply} 
          handleFeedbackDelete={handleFeedbackDelete}
        />
      );
      break;
    case "admin-occupancy":
      activeContent = (
        <AdminOccupancy 
          state={state} 
          onUpdateState={onUpdateState} 
          activeOperator={activeOperator} 
          handleOccupancyChange={handleOccupancyChange}
          setShowAddEquip={setShowAddEquip}
          setShowAddAnn={setShowAddAnn}
        />
      );
      break;
    case "admin-equipments":
      activeContent = (
        <AdminEquipments 
          state={state} 
          activeOperator={activeOperator} 
          onAddEquipment={onPureAddEquipment} 
          onUpdateEquipmentStatus={handleUpdateEquipmentStatus} 
          onDeleteEquipment={handleDeleteEquipment} 
        />
      );
      break;
    case "admin-announcements":
      activeContent = (
        <AdminAnnouncements 
          state={state} 
          activeOperator={activeOperator} 
          onAddAnnouncement={onPureAddAnnouncement} 
          onDeleteAnnouncement={handleDeleteAnnouncement} 
        />
      );
      break;
    case "admin-logs":
      activeContent = (
        <AdminLogs state={state} />
      );
      break;
    case "admin-staff":
      activeContent = (
        <AdminStaff 
          staffList={staffList} 
          isStaffLoading={isStaffLoading} 
          onAddStaff={onPureAddStaff} 
          onUpdateStaffRole={onPureAddStaff}
          onDeleteStaff={onPureDeleteStaff} 
          currentUserEmail={currentUser?.email || ""} 
        />
      );
      break;
    case "admin-reports":
      activeContent = (
        <AdminReports state={state} />
      );
      break;
    default:
      activeContent = (
        <AdminOccupancy 
          state={state} 
          onUpdateState={onUpdateState} 
          activeOperator={activeOperator} 
          handleOccupancyChange={handleOccupancyChange}
          setShowAddEquip={setShowAddEquip}
          setShowAddAnn={setShowAddAnn}
        />
      );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white relative">
      
      {/* Top Admin metadata header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-250 pb-5 mb-6 max-w-7xl mx-auto gap-3 animate-fade-in">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-805 tracking-wide flex items-center gap-2">
            <Shield className="h-5.5 w-5.5 text-purple-600 animate-pulse" />
            <span>工讀生值班管理後台</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            體育室工讀生控制中心。手動微調校正人數、覆寫區域狀態、管理器材、發布公告與回覆留言
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1 select-none font-sans shrink-0 self-stretch sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs bg-emerald-600 border border-emerald-555 text-white font-semibold py-1.5 px-3 rounded-xl shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>線上值班員：{activeOperator}</span>
          </div>
          <span className="text-[10px] text-right font-mono text-slate-400">目前帳號身份：{userRole === "admin" ? "系統管理員" : "體育室工讀生"}</span>
        </div>
      </header>

      {/* Main Admin features block split */}
      <div className="max-w-7xl mx-auto">
        {activeContent}
      </div>

      {/* ================= GLOBAL MODALS triggered from any page via shortcut ================= */}
      
      {/* 1. Add Equipment Modal */}
      {showAddEquip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-zoom-in border border-slate-100 text-xs">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 select-none">
              <h4 className="font-bold text-slate-805 text-sm flex items-center gap-1.5">
                <Wrench className="w-4.5 h-4.5 text-purple-600" />
                <span>手動修繕申報登記</span>
              </h4>
              <button 
                onClick={() => setShowAddEquip(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer transition-colors"
                type="button"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipmentModalSubmit} className="p-5 space-y-4 text-xs select-text">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">器材編號 (ID) *</label>
                  <input
                    type="text"
                    required
                    value={newEquipId}
                    onChange={(e) => setNewEquipId(e.target.value)}
                    placeholder="例如：TR-004"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono focus:bg-white focus:border-purple-500 transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">器材名稱 *</label>
                  <input
                    type="text"
                    required
                    value={newEquipName}
                    onChange={(e) => setNewEquipName(e.target.value)}
                    placeholder="例如：高拉力推舉機 4號"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans focus:bg-white focus:border-purple-500 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">擺放位置/區域</label>
                  <select
                    value={newEquipLoc}
                    onChange={(e) => setNewEquipLoc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans cursor-pointer focus:bg-white text-xs"
                  >
                    <option value="有氧區">有氧區</option>
                    <option value="重訓區">重訓區</option>
                    <option value="自由重量區">自由重量區</option>
                    <option value="伸展及拉伸區">伸展及拉伸區</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">申報狀態</label>
                  <select
                    value={newEquipStatus}
                    onChange={(e) => setNewEquipStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans cursor-pointer focus:bg-white text-xs"
                  >
                    <option value="故障中">故障中 (暫停使用)</option>
                    <option value="維修中">維修中 (理排除中)</option>
                    <option value="已修復">已修復 (排除恢復使用)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">故障細項原因詳細</label>
                <textarea
                  value={newEquipDesc}
                  onChange={(e) => setNewEquipDesc(e.target.value)}
                  placeholder="請詳述鋼磨損、卡榫鬆脫或皮帶打滑程度..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans focus:bg-white focus:border-purple-500 transition-all text-xs"
                  style={{ minHeight: "80px" }}
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">原廠預計修復排除日期</label>
                <input
                  type="text"
                  value={newEquipEst}
                  onChange={(e) => setNewEquipEst(e.target.value)}
                  placeholder="例如：2026/05/25"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono focus:bg-white focus:border-purple-500 transition-all text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => setShowAddEquip(false)}
                  className="py-2 px-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow shadow-purple-500/10 cursor-pointer text-xs"
                >
                  確認發佈修繕
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Announcement Modal */}
      {showAddAnn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-zoom-in border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 select-none">
              <h4 className="font-bold text-slate-805 text-sm flex items-center gap-1.5">
                <Bell className="w-4.5 h-4.5 text-purple-600" />
                <span>發佈前台公告欄新聞</span>
              </h4>
              <button 
                onClick={() => setShowAddAnn(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer transition-colors"
                type="button"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddAnnouncementModalSubmit} className="p-5 space-y-4 text-xs select-text">
              <div>
                <label className="block font-semibold text-slate-600 mb-1.5">公告文字內容 *</label>
                <textarea
                  required
                  value={announcementInput}
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  placeholder="例：由於 05/26 為全校運動會，中大健身房伸展區及有氧區將進行地毯消毒，本日將對外暫停休業一日，造成不便請配合諒解。"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-sans focus:bg-white focus:border-purple-500 transition-all text-xs"
                  style={{ minHeight: "135px" }}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => setShowAddAnn(false)}
                  className="py-2 px-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow shadow-purple-500/10 cursor-pointer text-xs"
                >
                  確認發佈公告
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
