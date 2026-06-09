import React, { useState } from "react";
import { UserCheck, Plus, Trash2, Mail, ShieldAlert, BadgeCheck, Shield } from "lucide-react";

interface StaffMember {
  email: string;
  role: string;
  assignedAt: string;
  assignedBy?: string;
}

interface AdminStaffProps {
  staffList: StaffMember[];
  isStaffLoading: boolean;
  onAddStaff: (email: string, role: string) => Promise<boolean>;
  onUpdateStaffRole: (email: string, role: string) => Promise<boolean>;
  onDeleteStaff: (email: string) => Promise<void>;
  currentUserEmail: string;
}

const maskEmail = (email: string | null | undefined): string => {
  if (!email) return "";
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 3) {
    return name.charAt(0) + "***@" + domain;
  }
  return name.substring(0, 2) + "******" + name.charAt(name.length - 1) + "@" + domain;
};

export default function AdminStaff({
  staffList,
  isStaffLoading,
  onAddStaff,
  onUpdateStaffRole,
  onDeleteStaff
}: AdminStaffProps) {
  const [newEmail, setNewEmail] = useState<string>("2"); // Start empty
  const [newRole, setNewRole] = useState<string>("staff");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("2");

  // Since we initialized state, clean them up for rendering
  React.useEffect(() => {
    setNewEmail("");
    setMsg("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mail = newEmail.trim().toLowerCase();
    if (!mail) return;

    if (!mail.includes("@")) {
      alert("請輸入完整的 Google 信箱地址！格式例如：test@gmail.com");
      return;
    }

    setSubmitting(true);
    try {
      const ok = await onAddStaff(mail, newRole);
      if (ok) {
        setMsg(`已成功將此帳號 ${maskEmail(mail)} 加入且權限指派為 【${newRole === 'admin' ? '共同管理者' : '值班工讀生'}】！`);
        setNewEmail("");
        setNewRole("staff");
        setTimeout(() => setMsg(""), 4500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 select-none bg-white p-2">
      
      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Left Column: Input Form */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans">
              <UserCheck className="w-4.5 h-4.5 text-purple-600" />
              <span>指派新組員與管理權限</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">輸入對方的 Google Email 信箱登錄以授予值勤或管理級權限</p>
          </div>

          {msg && (
            <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl text-emerald-700 text-xs font-semibold animate-fade-in animate-pulse font-sans">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs select-text font-sans">
            <div>
              <label className="block text-slate-605 font-bold mb-1.5 flex items-center gap-1">
                <Mail className="w-1.5 h-3.5 text-slate-400" />
                <span>Google 電子信箱</span>
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="例如：student@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl p-2.5 outline-none font-mono text-xs font-bold text-slate-805 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-605 font-bold mb-1.5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>指派系統角色權限</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl p-2.5 outline-none font-sans text-xs font-bold text-slate-805 transition-all cursor-pointer"
              >
                <option value="staff">值班工讀生 (PE Crew)</option>
                <option value="admin">共同管理者 (Head Admin)</option>
              </select>
            </div>

            <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-100/50 space-y-1.5 select-none text-[11px] leading-relaxed">
              <p className="text-[11.5px] font-bold text-purple-700 flex items-center gap-1 font-sans">
                <BadgeCheck className="w-4 h-4 text-purple-600" />
                <span>指派說明：</span>
              </p>
              <p className="text-purple-650 ml-5">
                ● <b>值班工讀生：</b>可修改在館人數、調整區域飽和燈號、新增報修及回覆留言<br />
                ● <b>共同管理者：</b>具備工讀生全部權限，並可額外指派或修改其他組員的權限
              </p>
            </div>

            <button
              id="btn-assign-staff-submit"
              type="submit"
              disabled={submitting || !newEmail.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-400 shadow-md shadow-purple-100 transition-transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? "登錄指派中..." : "立刻完成指派授權"}</span>
            </button>
          </form>
        </div>

        {/* Right Columns: Active Staff list (Col 2 & 3) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
          
          <div>
            <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans">
              <BadgeCheck className="w-4.5 h-4.5 text-purple-600" />
              <span>值勤中/已授權中大工讀員與管理幹部名單</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">體育室目前登陸有案、可利用學校信箱安全登入值班的人員列表</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100 text-xs text-slate-805">
            <table className="w-full text-left border-collapse text-xs select-text">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-505 font-mono select-none">
                  <th className="py-2.5 px-4 font-bold">授權帳號 (Email安全遮蔽)</th>
                  <th className="py-2.5 px-4 font-bold">權限等級指派</th>
                  <th className="py-2.5 px-4 font-bold">指派時間 (UTC+8)</th>
                  <th className="py-2.5 px-4 font-bold">引薦指派者 (Peers)</th>
                  <th className="py-2.5 px-4 font-bold text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {isStaffLoading ? (
                  <tr className="select-none">
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-sans italic">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>聯網讀取授權庫資料中...</span>
                      </div>
                    </td>
                  </tr>
                ) : staffList.length > 0 ? (
                  staffList.map(st => {
                    const formattedDate = st.assignedAt ? new Date(st.assignedAt).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : "--";
                    return (
                      <tr key={st.email} className="border-b border-slate-100 hover:bg-slate-50/45 text-slate-705 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{maskEmail(st.email)}</td>
                        <td className="py-3 px-4">
                          <select
                            value={st.role || "staff"}
                            onChange={async (e) => {
                              const targetRole = e.target.value;
                              const ok = await onUpdateStaffRole(st.email, targetRole);
                              if (ok) {
                                alert(`已成功將 ${maskEmail(st.email)} 的權限調整為 【${targetRole === 'admin' ? '共同管理者' : '值班工讀生'}】！`);
                              }
                            }}
                            className="bg-white border border-slate-200 text-[11px] py-1 px-2.5 rounded-xl font-bold text-slate-750 outline-none cursor-pointer font-sans"
                          >
                            <option value="staff">值班工讀生 (PE Crew)</option>
                            <option value="admin">共同管理者 (Head Admin)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-slate-450 font-mono text-[11px]">{formattedDate}</td>
                        <td className="py-3 px-4 text-slate-500 font-medium truncate max-w-xs">{st.assignedBy ? maskEmail(st.assignedBy) : "Super Admin"}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onDeleteStaff(st.email)}
                            className="text-slate-405 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl border border-transparent hover:border-red-100 transition-colors cursor-pointer text-xs"
                            title="吊銷權限"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="select-none font-sans">
                    <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                      目前除了最高管理員信箱外，尚無其餘委派人員。您可以使用左方欄位進行授權指派！
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-[10px] text-slate-500 font-mono leading-relaxed select-none font-sans">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              安全防護機制已生效：Google 帳密地址已於前端全面安全遮蔽，防止機敏信息外流。
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
