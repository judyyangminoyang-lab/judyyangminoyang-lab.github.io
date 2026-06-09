import { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  Wrench, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Filter, 
  Info,
  Layers,
  TrendingUp
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface EquipmentFaultsProps {
  state: GymStateSnapshot;
}

export default function EquipmentFaults({ state }: EquipmentFaultsProps) {
  const [filterStatus, setFilterStatus] = useState<"全部" | "故障中" | "維修中" | "已修復">("全部");
  const [filterLocation, setFilterLocation] = useState<string>("全部位置");
  
  // Calculate stats based on actual equipment state
  const badCount = state.equipments.filter(e => e.status === "故障中").length;
  const repCount = state.equipments.filter(e => e.status === "維修中").length;
  const fixedCount = state.equipments.filter(e => e.status === "已修復").length + 8; // Including mockup past repairs
  const avgFixDays = 2.6;

  // Filtered dataset
  const filteredEquip = state.equipments.filter(item => {
    const statMatches = filterStatus === "全部" || item.status === filterStatus;
    const locMatches = filterLocation === "全部位置" || 
                       item.location.includes(filterLocation) || 
                       (filterLocation === "伸展區" && item.location.includes("伸展"));
    return statMatches && locMatches;
  });

  // Recent 7 days faulty trend data for recharts
  const trendData = [
    { date: "05/14", "故障件數": 1 },
    { date: "05/15", "故障件數": 2 },
    { date: "05/16", "故障件數": 3 },
    { date: "05/17", "故障件數": 2 },
    { date: "05/18", "故障件數": 4 },
    { date: "05/19", "故障件數": 3 },
    { date: "05/20", "故障件數": 3 }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white select-none">
      
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 max-w-7xl mx-auto gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-950 tracking-tight flex items-center gap-2">
            <Wrench className="h-5 w-5 text-purple-600" />
            <span>故障器材管理與總覽</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            即時彙報器材妥善率與進展度。保障使用者运动安全並提高特種維護廠商排除工序
          </p>
        </div>

        {/* Location Dropdown selector */}
        <div className="flex bg-white items-center p-1.5 rounded-xl border border-gray-150 shadow-sm gap-2 shrink-0 self-stretch md:self-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <span className="text-xs text-slate-500">區域篩選：</span>
          <select 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent border-none outline-none mr-1 cursor-pointer"
          >
            <option value="全部位置">全部區域</option>
            <option value="重訓區">重訓區</option>
            <option value="有氧區">有氧區</option>
            <option value="自由重量區">自由重量區</option>
            <option value="伸展區">伸展拉伸區</option>
          </select>
        </div>
      </header>

      {/* Top 4 Stat Blocks Dashboard Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-6">
        
        {/* Stat block 1 */}
        <div className="bg-white p-4.5 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between group hover:border-red-200 transition-all">
          <div className="min-w-0">
            <p className="text-[10px] font-bold font-mono text-red-500 uppercase tracking-wider">故障中 (暫停使用)</p>
            <p className="text-2xl font-black font-sans text-gray-800 tracking-tight mt-1">{badCount} <span className="text-xs font-semibold text-gray-450">&nbsp;件</span></p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-650 shrink-0">
            <AlertCircle className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Stat block 2 */}
        <div className="bg-white p-4.5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all">
          <div className="min-w-0">
            <p className="text-[10px] font-bold font-mono text-amber-500 uppercase tracking-wider">修復維修中 (廠家理理)</p>
            <p className="text-2xl font-black font-sans text-gray-800 tracking-tight mt-1">{repCount} <span className="text-xs font-semibold text-gray-450">&nbsp;件</span></p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-550 shrink-0">
            <Wrench className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Stat block 3 */}
        <div className="bg-white p-4.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div className="min-w-0">
            <p className="text-[10px] font-bold font-mono text-emerald-500 uppercase tracking-wider">已修復排除 (本月累計)</p>
            <p className="text-2xl font-black font-sans text-gray-800 tracking-tight mt-1">{fixedCount} <span className="text-xs font-semibold text-gray-450">&nbsp;件</span></p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-550 shrink-0">
            <CheckCircle className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Stat block 4 */}
        <div className="bg-white p-4.5 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between group hover:border-purple-200 transition-all">
          <div className="min-w-0">
            <p className="text-[10px] font-bold font-mono text-purple-500 uppercase tracking-wider">平均修復流程時間</p>
            <p className="text-2xl font-black font-sans text-gray-800 tracking-tight mt-1">{avgFixDays} <span className="text-xs font-semibold text-gray-450">&nbsp;天</span></p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <Clock className="w-5.5 h-5.5" />
          </div>
        </div>

      </section>

      {/* Main Grid: Left Side Table & Filters, Right Side bubble map-dots & graph */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* Left Side: Table & Tab Filters (Takes 2 span) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-5 gap-3">
              <h3 className="text-base font-bold text-gray-805 flex items-center gap-1.5 font-sans">
                <Wrench className="w-4.5 h-4.5 text-purple-600" />
                <span>器材故障清單</span>
              </h3>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-150 inline-flex">
                {["全部", "故障中", "維修中", "已修復"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab as any)}
                    className={`py-1 px-3 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${
                      filterStatus === tab ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Render table sheet */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono tracking-wide">
                    <th className="py-2.5 px-4 font-bold">器材編號</th>
                    <th className="py-2.5 px-4 font-bold">器材名稱</th>
                    <th className="py-2.5 px-4 font-bold">擺放位置</th>
                    <th className="py-2.5 px-4 font-bold">狀態</th>
                    <th className="py-2.5 px-4 font-bold">故障原因描述</th>
                    <th className="py-2.5 px-4 font-bold">回報登記</th>
                    <th className="py-2.5 px-4 font-bold">預計排除完成</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquip.map((item) => {
                    let badgeColor = "bg-red-50 text-red-650 border-red-150";
                    if (item.status === "維修中") {
                      badgeColor = "bg-amber-50 text-amber-600 border-amber-150";
                    } else if (item.status === "已修復") {
                      badgeColor = "bg-green-50 text-green-650 border-green-150";
                    }
                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/40 text-slate-700 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-905">{item.id}</td>
                        <td className="py-3 px-4 font-bold">{item.name}</td>
                        <td className="py-3 px-4 text-slate-500">{item.location}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${badgeColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500 font-sans" title={item.description}>
                          {item.description}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{item.reportTime}</td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-500 font-bold">{item.estRepairDate}</td>
                      </tr>
                    );
                  })}
                  {filteredEquip.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-sans italic">
                        當前無該條件下之故障器材紀錄。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex gap-2.5 items-center text-[10.5px] text-gray-500 bg-purple-50/20 p-2.5 rounded-xl border border-purple-100">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>如遇 any 重訓或有氧設備異常，可至現場找值勤工讀生做即時登記彙報補錄。</span>
          </div>
        </div>

        {/* Right Side: Simple bubble map-dots & graph (1 span) */}
        <div className="flex flex-col gap-6">
          
          {/* Bubble map-dots distribution */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-850 flex items-center gap-1.5 mb-1">
              <Layers className="w-4.5 h-4.5 text-purple-600" />
              <span>器材位置分佈圖</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4 font-sans">館內各分區（故障 / 該區總件數）比例對照</p>

            {/* Layout simulation with styled absolute dots matching the mockup */}
            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center relative aspect-[14/9] overflow-hidden">
              
              {/* Mock NCU Gym map outline background with bubbles */}
              <div className="relative w-full h-full border-2 border-slate-200 rounded-xl bg-white p-1">
                
                <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-1">
                  
                  {/* Cardio area */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center relative group">
                     <span className="text-[10px] font-semibold text-slate-500">有氧區</span>
                     <div className="mt-1.5 flex items-center justify-center bg-red-500 text-white w-9 h-9 rounded-full shadow-lg font-mono text-xs font-black select-none pointer-events-none group-hover:scale-110 transition-transform">
                       {badCount + repCount}/{state.regions[0].limit}
                     </div>
                     <span className="absolute bottom-1 text-[8px] font-mono text-gray-400">(左上區域)</span>
                  </div>
 
                  {/* Weights area */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center relative group">
                     <span className="text-[10px] font-semibold text-slate-500">重訓區</span>
                     <div className="mt-1.5 flex items-center justify-center bg-amber-500 text-white w-9 h-9 rounded-full shadow-lg font-mono text-xs font-black select-none pointer-events-none group-hover:scale-110 transition-transform">
                       2/18
                     </div>
                     <span className="absolute bottom-1 text-[8px] font-mono text-gray-400">(右上區域)</span>
                  </div>
 
                  {/* Free weights */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center relative group">
                     <span className="text-[10px] font-semibold text-slate-500">自由重量區</span>
                     <div className="mt-1.5 flex items-center justify-center bg-emerald-500 text-white w-9 h-9 rounded-full shadow-lg font-mono text-xs font-black select-none pointer-events-none group-hover:scale-110 transition-transform">
                       0/6
                     </div>
                     <span className="absolute bottom-1 text-[8px] font-mono text-gray-400">(左下區域)</span>
                  </div>
 
                  {/* Stretch area */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center relative group">
                     <span className="text-[10px] font-semibold text-slate-500">伸展拉伸區</span>
                     <div className="mt-1.5 flex items-center justify-center bg-emerald-500 text-white w-9 h-9 rounded-full shadow-lg font-mono text-xs font-black select-none pointer-events-none group-hover:scale-110 transition-transform">
                       0/4
                     </div>
                     <span className="absolute bottom-1 text-[8px] font-mono text-gray-400">(右下區域)</span>
                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* Fault rate trend line (1 span) */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex-1">
            <h3 className="text-base font-bold text-gray-805 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4.5 h-4.5 text-purple-600" />
              <span>近期故障異動趨勢</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4 font-sans">過去 7 天內在處理故障件數波峰統計</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={9.5} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9.5} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#581C87", borderRadius: "10px", border: "none", color: "#fff", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="故障件數" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
