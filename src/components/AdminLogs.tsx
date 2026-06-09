import React, { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  ClipboardList, 
  Search, 
  ArrowRight
} from "lucide-react";

interface AdminLogsProps {
  state: GymStateSnapshot;
}

export default function AdminLogs({ state }: AdminLogsProps) {
  const [operatorFilter, setOperatorFilter] = useState<string>("");
  const [actionCategory, setActionCategory] = useState<string>("All");

  const filteredLogs = state.logs.filter(log => {
    // Operator search match
    const opMatches = !operatorFilter || (log.user || "系統管理員").toLowerCase().includes(operatorFilter.toLowerCase());
    
    // Category match
    const categoryMatches = actionCategory === "All" || log.action === actionCategory;

    return opMatches && categoryMatches;
  });

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
      
      {/* Search and Filters Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 gap-3 select-none">
        <div>
          <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans">
            <ClipboardList className="w-4.5 h-4.5 text-purple-600 animate-pulse" />
            <span>操作紀錄與安全審計軌跡</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">系統自動補捉所有管理後台與工讀生的調校細節，防範篡改與偏差</p>
        </div>

        {/* Sync Indicator */}
        <div className="text-[10px] text-emerald-600 font-mono bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 font-bold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>即時連線防護中 (Realtime)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs py-1.5 select-text">
        {/* Filter 1: Search by Name */}
        <div className="relative font-sans">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            placeholder="搜尋操作人員工號/信箱..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl text-xs outline-none transition-all"
          />
        </div>

        {/* Filter 2: Dropdown Category */}
        <div className="relative font-sans">
          <select
            value={actionCategory}
            onChange={(e) => setActionCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl p-2 px-3 outline-none cursor-pointer focus:bg-white text-xs text-slate-700 font-bold transition-all"
          >
            <option value="All">顯示全部異動類別</option>
            <option value="人數校正">人數校正</option>
            <option value="區域覆寫">區域覆寫</option>
            <option value="設備申報">設備申報</option>
            <option value="公告變更">公告變更</option>
            <option value="時段人數校正">時段人數校正</option>
            <option value="留言回覆">留言回覆</option>
          </select>
        </div>

        {/* Simple count detail */}
        <div className="flex items-center justify-end text-[10px] font-mono text-slate-400">
          <span>符合篩選：<strong>{filteredLogs.length}</strong> / {state.logs.length} 筆日誌</span>
        </div>
      </div>

      {/* Main Table view */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 text-xs">
        <table className="w-full text-left border-collapse text-xs select-text">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-505 font-mono select-none">
              <th className="py-2.5 px-4 font-bold">異動時間</th>
              <th className="py-2.5 px-4 font-bold">值班人員</th>
              <th className="py-2.5 px-4 font-bold">指令類別</th>
              <th className="py-2.5 px-4 font-bold">事件詳細描述</th>
              <th className="py-2.5 px-4 font-bold text-center">變動前狀態</th>
              <th className="py-2.5 px-4 font-bold text-center">變動後狀況</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => {
                let badgeStyle = "bg-slate-105 text-slate-705 border-slate-205";
                if (log.action === "人數計數校正" || log.action === "人數校正") {
                  badgeStyle = "bg-green-50 text-green-700 border-green-150";
                } else if (log.action === "區域覆寫") {
                  badgeStyle = "bg-pink-50 text-pink-700 border-pink-150";
                } else if (log.action === "設備申報" || log.action === "維修更動") {
                  badgeStyle = "bg-amber-50 text-amber-700 border-amber-150";
                } else if (log.action === "公告變更") {
                  badgeStyle = "bg-purple-50 text-purple-700 border-purple-150";
                }

                return (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/45 text-slate-700 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-400 shrink-0">{log.time}</td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-800">{log.user || "系統管理員"}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded-lg border text-[9.5px] font-extrabold ${badgeStyle}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-600 leading-normal max-w-sm">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 italic text-center">[{log.before || "--"}]</td>
                    <td className="py-3 px-4 font-mono text-center">
                      <div className="flex items-center justify-center gap-1 font-bold">
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="text-emerald-600">[{log.after}]</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="select-none">
                <td colSpan={6} className="py-12 text-center text-slate-400 font-sans italic">
                  💡 沒有符合篩選器條件的動作日誌。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
