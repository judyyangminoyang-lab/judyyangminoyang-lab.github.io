import React, { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  Users, 
  Search, 
  Edit3, 
  Save, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Minus, 
  Wrench, 
  Bell, 
  FileSpreadsheet, 
  Download,
  AlertTriangle,
  Shield
} from "lucide-react";

interface AdminOccupancyProps {
  state: GymStateSnapshot;
  onUpdateState: (newState: GymStateSnapshot) => void;
  activeOperator: string;
  handleOccupancyChange: (method: "inc" | "dec" | "set", value?: number) => Promise<void>;
  setShowAddEquip: (show: boolean) => void;
  setShowAddAnn: (show: boolean) => void;
}

interface TrafficSlot {
  id: string;
  timeRange: string;
  entrances: number;
  exits: number;
}

export default function AdminOccupancy({
  state,
  onUpdateState,
  activeOperator,
  handleOccupancyChange,
  setShowAddEquip,
  setShowAddAnn
}: AdminOccupancyProps) {

  // Local state cache of traffic data that users can edit
  const [trafficSlots, setTrafficSlots] = useState<TrafficSlot[]>([
    { id: "1", timeRange: "08:00 - 10:00", entrances: 32, exits: 15 },
    { id: "2", timeRange: "10:00 - 12:00", entrances: 45, exits: 30 },
    { id: "3", timeRange: "12:00 - 14:00", entrances: 24, exits: 35 },
    { id: "4", timeRange: "14:00 - 16:00", entrances: 55, exits: 48 },
    { id: "5", timeRange: "16:00 - 18:00", entrances: 71, exits: 52 },
    { id: "6", timeRange: "18:00 - 20:00", entrances: 112, exits: 80 },
    { id: "7", timeRange: "20:00 - 22:00", entrances: 84, exits: 92 },
  ]);

  const [selectedSlotId, setSelectedSlotId] = useState<string>("1");
  const [inCount, setInCount] = useState<number>(32);
  const [outCount, setOutCount] = useState<number>(15);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [manualCountInput, setManualCountInput] = useState<string>("");

  const actualPercent = Math.round((state.currentOccupancy / state.maxLimit) * 100);

  const handleSelectSlot = (slot: TrafficSlot) => {
    setSelectedSlotId(slot.id);
    setInCount(slot.entrances);
    setOutCount(slot.exits);
  };

  const handleUpdateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = trafficSlots.map(s => {
      if (s.id === selectedSlotId) {
        const details = `修改 [${s.timeRange}] 時段人數：進館 ${s.entrances}➔${inCount}人，離館 ${s.exits}➔${outCount}人`;
        const newLog = {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          user: activeOperator,
          action: "時段人數校正",
          details,
          before: `${s.entrances}進/${s.exits}出`,
          after: `${inCount}進/${outCount}出`
        };

        const updatedLogs = [newLog, ...state.logs];
        
        onUpdateState({
          ...state,
          logs: updatedLogs
        });

        return { ...s, entrances: inCount, exits: outCount };
      }
      return s;
    });

    setTrafficSlots(updated);
    setSuccessMsg("時段人流量校正成功，修改紀錄已登載至操作日誌中！");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleExportLogs = () => {
    alert("【系統日誌導出成功】\n已成功打包 2026/05/22 之前台操作日誌表格並傳送至體育室行政主機存檔。");
  };

  const filteredSlots = trafficSlots.filter(s => 
    s.timeRange.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none bg-white p-2">
      
      {/* 1. 上方面板 - 即時人數微調區 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Card 1: 即時在館人數微調 */}
        <div id="occupancy-controller-card" className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans mb-3">
              <Users className="w-4.5 h-4.5 text-purple-600" />
              <span>即時在館人數微調</span>
            </h3>
            
            <div className="bg-slate-50/70 rounded-2xl p-4.5 flex flex-col items-center border border-slate-100/50">
              <p className="text-[10px] font-mono text-slate-400 uppercase">目前容納數</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{state.currentOccupancy}人</p>
              
              {/* Dial indicator bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3 max-w-xs">
                <div 
                  className={`h-full transition-all duration-300 ${actualPercent >= 90 ? "bg-red-500" : "bg-purple-600"}`}
                  style={{ width: `${Math.min(actualPercent, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between w-full max-w-xs font-mono text-[9px] text-slate-400 mt-1.5">
                <span>飽和比: {actualPercent}%</span>
                <span>上限: {state.maxLimit}人</span>
              </div>
            </div>

            {/* Inc / Dec controller buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                id="btn-occupancy-dec"
                onClick={() => handleOccupancyChange("dec")}
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-655 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                type="button"
              >
                <Minus className="w-4.5 h-4.5" />
                <span>離館 -1</span>
              </button>
              <button
                id="btn-occupancy-inc"
                onClick={() => handleOccupancyChange("inc")}
                className="py-2.5 px-4 bg-green-50 hover:bg-green-100 border border-green-200 text-green-655 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                type="button"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>進館 +1</span>
              </button>
            </div>
          </div>

          {/* Direct manual text entry */}
          <div className="mt-4 pt-3.5 border-t border-gray-100 flex gap-2">
            <input
              id="input-manual-occupancy"
              type="number"
              value={manualCountInput}
              onChange={(e) => setManualCountInput(e.target.value)}
              placeholder="直接輸入數值"
              className="bg-gray-50 hover:border-gray-300 focus:bg-white border border-gray-200 focus:border-purple-500 rounded-xl p-2 text-xs font-mono text-slate-800 min-w-0 flex-1 outline-none transition-all"
            />
            <button
              id="btn-manual-occupancy-submit"
              onClick={() => {
                const num = parseInt(manualCountInput);
                if (!isNaN(num)) {
                  handleOccupancyChange("set", num);
                  setManualCountInput("");
                }
              }}
              className="bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white font-sans text-xs font-bold px-4 rounded-xl cursor-pointer transition-all"
              type="button"
            >
              直接更新
            </button>
          </div>
        </div>

        {/* Card 2: 今日數據流量統計 */}
        <div id="today-stats-card" className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans mb-3">
              <TrendingUp className="w-4.5 h-4.5 text-purple-600" />
              <span>今日數據流量統計</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-sans font-medium">總累計進館人數</span>
                <span className="text-sm font-bold text-gray-800 font-mono">256 人次</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-sans font-medium">總累計離場人數</span>
                <span className="text-sm font-bold text-gray-800 font-mono">214 人次</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-sans font-medium">高峰預期時段</span>
                <span className="text-sm font-bold text-amber-600 font-sans">18:00 - 21:00</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-400 font-sans font-medium">平均停留時數</span>
                <span className="text-sm font-bold text-gray-800 font-mono">2.6 小時</span>
              </div>
            </div>
          </div>

          {/* Warning alert panel directly integrated */}
          <div className={`p-3 rounded-2xl border text-xs gap-2 flex items-center mt-4 ${
            actualPercent >= 90
              ? "bg-red-50 border-red-200 text-red-750 animate-pulse font-bold"
              : "bg-purple-50/50 border-purple-100 text-purple-855"
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 animate-bounce" />
            <span className="font-semibold">
              {actualPercent >= 90
                ? "飽和度突破 90% 限流！請引導門口排長隊等待。"
                : "目前容留安全，進館流量平穩無擁塞。"}
            </span>
          </div>
        </div>

        {/* Card 3: 後台快捷操作面板 */}
        <div id="quick-action-launchpad-card" className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-855 flex items-center gap-1.5 font-sans mb-3">
              <Shield className="w-4.5 h-4.5 text-purple-600" />
              <span>後台快捷操作面板</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4 font-sans">值班工讀生快捷申填指令，隨即同步前台</p>

            <div className="space-y-2.5">
              <button
                id="btn-quick-new-ann"
                onClick={() => setShowAddAnn(true)}
                className="w-full bg-purple-50 hover:bg-purple-100/75 border border-purple-150 text-purple-700 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-between cursor-pointer transition-transform hover:-translate-y-0.5"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>一鍵新增前台通知公告</span>
                </span>
                <Plus className="w-4 h-4" />
              </button>

              <button
                id="btn-quick-new-equip"
                onClick={() => setShowAddEquip(true)}
                className="w-full bg-amber-50 hover:bg-amber-100/75 border border-amber-150 text-amber-700 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-between cursor-pointer transition-transform hover:-translate-y-0.5"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span>手動舉報新增故障器材</span>
                </span>
                <Plus className="w-4 h-4" />
              </button>

              <button
                id="btn-quick-export-reports"
                onClick={handleExportLogs}
                className="w-full bg-slate-105 border border-slate-200 text-slate-700 py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-between cursor-pointer transition-all hover:bg-slate-100"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>匯出操作紀錄日誌報表</span>
                </span>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 bg-slate-50/50 p-2 border border-slate-100 rounded-xl text-center leading-relaxed mt-4">
            系統操作安全：任何參數異動將直接記錄於操作紀錄備查。
          </div>
        </div>



      </section>

      {/* 2. 下方面板 - 歷史時段校正區 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Editable Form */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5">
              <Edit3 className="w-4.5 h-4.5 text-purple-600" />
              <span>修改特定時段人數登記</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">選定下方列表之特定時間間隔，並覆寫其進退館登記數進行校準</p>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl text-emerald-700 text-xs font-semibold animate-fade-in animate-pulse">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleUpdateSlot} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-slate-600 font-bold mb-1">選擇校正時段</label>
              <select
                value={selectedSlotId}
                onChange={(e) => {
                  const s = trafficSlots.find(slot => slot.id === e.target.value);
                  if (s) handleSelectSlot(s);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800 focus:bg-white focus:border-purple-500 cursor-pointer text-xs"
              >
                {trafficSlots.map(s => (
                  <option key={s.id} value={s.id}>{s.timeRange}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold mb-1">進館人數 (人)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={inCount}
                  onChange={(e) => setInCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-800 font-bold focus:bg-white focus:border-purple-500 transition-all font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">離館人數 (人)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={outCount}
                  onChange={(e) => setOutCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-800 font-bold focus:bg-white focus:border-purple-500 transition-all font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100/50 space-y-1">
              <p className="text-[10px] font-bold text-purple-700">📌 校核說明：</p>
              <p className="text-[10px] text-purple-600 leading-relaxed">
                變更人流不影響即時在館計數，但有利於改善「歷史熱門時段走勢圖」的精確度與尖峰回歸統計之信度。
              </p>
            </div>

            <button
              id="btn-occupancy-update-slot"
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-transform hover:-translate-y-0.5 shadow-md shadow-purple-100"
            >
              <Save className="w-4 h-4" />
              <span>落實更動申報</span>
            </button>
          </form>
        </div>

        {/* Right Columns: Main DataTable (Col 2 & 3) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-purple-600" />
                <span>對特定時段客流紀錄進行校正登記</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">系統即時統計之中大體育館各班段流動狀況</p>
            </div>
            {/* Simple search bar */}
            <div className="relative w-48 text-xs shrink-0 select-text font-sans">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋時段..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl text-xs outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100 text-xs">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono">
                  <th className="py-2.5 px-4 font-bold">校核時區</th>
                  <th className="py-2.5 px-4 font-bold">進館人數 (Entrance)</th>
                  <th className="py-2.5 px-4 font-bold">離館人數 (Exits)</th>
                  <th className="py-2.5 px-4 font-bold">時段淨增數</th>
                  <th className="py-2.5 px-4 font-bold">覆核狀態</th>
                  <th className="py-2.5 px-4 font-bold">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map(s => {
                  const net = s.entrances - s.exits;
                  return (
                    <tr 
                      key={s.id} 
                      className={`border-b border-slate-100 transition-colors text-slate-700 hover:bg-slate-50/45 ${
                        s.id === selectedSlotId ? "bg-purple-50/20 text-purple-700" : ""
                      }`}
                    >
                      <td className="py-2.5 px-4 font-bold flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.id === selectedSlotId ? "bg-purple-600 animate-pulse" : "bg-slate-300"}`}></span>
                        <span>{s.timeRange}</span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{s.entrances} 人</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-500">{s.exits} 人</td>
                      <td className={`py-2.5 px-4 font-mono font-bold ${net >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                        {net >= 0 ? `+${net}` : net}人
                      </td>
                      <td className="py-2.5 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded-lg border text-[9.5px] font-bold ${
                          s.id === selectedSlotId 
                            ? "bg-purple-50 text-purple-700 border-purple-150" 
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                          {s.id === selectedSlotId ? "正在編輯" : "系統正常"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => handleSelectSlot(s)}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 py-1 px-2.5 rounded-lg font-bold transition-all text-[11px] cursor-pointer"
                          type="button"
                        >
                          帶入調整
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </section>

    </div>
  );
}
