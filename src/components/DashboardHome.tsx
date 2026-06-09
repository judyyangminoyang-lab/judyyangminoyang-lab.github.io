import { GymStateSnapshot } from "../types";
import { 
  Users, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Megaphone, 
  Wrench, 
  ChevronRight, 
  EyeOff,
  Bell
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from "recharts";

interface DashboardHomeProps {
  state: GymStateSnapshot;
  onNavigate: (tabId: string) => void;
}

export default function DashboardHome({ state, onNavigate }: DashboardHomeProps) {
  const pct = (state.currentOccupancy / state.maxLimit) * 105; // standard scaling for aesthetics
  const actualPercent = Math.round((state.currentOccupancy / state.maxLimit) * 100);

  // Determine status color theme
  let statusColor = "text-green-600 bg-green-50 border-green-200";
  let statusBg = "from-green-500 to-emerald-600";
  let statusText = "清閒";
  let statusDesc = "人潮極少，所有器材無需排隊";

  if (actualPercent >= 90) {
    statusColor = "text-red-600 bg-red-50 border-red-200 animate-pulse";
    statusBg = "from-red-500 to-rose-600";
    statusText = "即將客滿";
    statusDesc = "即將到達容留上限，準備啟動現場管制";
  } else if (actualPercent >= 75) {
    statusColor = "text-yellow-800 bg-yellow-50/75 border-yellow-300 shadow-[0_1px_2px_rgba(234,179,8,0.1)]"; // Yellow as supporting alert color
    statusBg = "from-yellow-400 to-amber-500 shadow-md";
    statusText = "擁擠";
    statusDesc = "人潮眾多，熱門有氧器材需排隊等待";
  } else if (actualPercent >= 40) {
    statusColor = "text-purple-600 bg-purple-50 border-purple-200"; // Purple as primary color
    statusBg = "from-purple-500 to-purple-700";
    statusText = "普通";
    statusDesc = "人數適中，伸展及重訓區器材充足";
  }

  // Formatting chart data
  const chartData = state.hourlyHistory.map((val, idx) => ({
    time: `${String(idx).padStart(2, "0")}:00`,
    "今日人數": val,
    "昨日人數": state.yesterdayHourlyHistory[idx] || 0
  }));

  // Filter current active/upcoming predictions
  const pred30m = Math.min(50, Math.round(state.currentOccupancy * (actualPercent >= 75 ? 1.05 : 0.95)));
  const pred1h = Math.min(50, Math.round(state.currentOccupancy * (actualPercent >= 75 ? 1.12 : 0.88)));
  const pred2h = Math.min(50, Math.round(state.currentOccupancy * (actualPercent >= 75 ? 0.9 : 0.75)));

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white relative select-none">
      
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-5 max-w-7xl mx-auto gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-gray-900 tracking-tight flex items-center gap-2">
            首頁
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1 font-sans">
            <span>嗨！今天也要好好運動</span> 
            <span className="text-base text-amber-500">💪</span>
          </p>
        </div>

        {/* Right Info Badges */}
        <div className="flex items-center space-x-3 self-stretch md:self-auto justify-end">
          <div 
            onClick={() => onNavigate("announcements")} 
            className="p-2.5 bg-white text-gray-655 border border-gray-100 hover:text-purple-600 hover:bg-purple-50/30 rounded-2xl shadow-sm cursor-pointer transition-all relative"
            title="查看近期公告"
          >
            <Bell className="h-4.5 w-4.5" />
            {state.announcements.some(a => a.isNew) && (
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            )}
          </div>
        </div>
      </header>

      {/* Main Core Elements Row (Bento Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-8">
        
        {/* Core Widget 1: Immediate Occupancy Segmented LED Peak Equalizer Meter */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-gray-405 uppercase mb-2 flex items-center justify-between w-full">
              <span>即時人數動態計</span>
              <Users className="w-4 h-4 text-purple-400" />
            </h3>

            {/* Enlarged & Centered Real-Time Occupancy Above the Meter */}
            <div className="text-center my-4 py-1 select-none">
              <div className="text-6xl font-black font-sans text-purple-600 tracking-tight flex items-baseline justify-center gap-1.5">
                <span>{state.currentOccupancy}</span>
                <span className="text-lg font-bold text-slate-500">人</span>
              </div>
              <div className="text-xs font-bold text-slate-600 mt-1 flex items-center justify-center gap-2">
                <span className="font-mono text-purple-600 bg-purple-55/70 py-0.5 px-2 rounded-md">
                  相對容能 {actualPercent}%
                </span>
                <span className="text-slate-400">
                  (上限 {state.maxLimit} 人)
                </span>
              </div>
            </div>

            <div className="w-full flex flex-col mt-2">
              <div className="flex justify-between items-center w-full mb-1">
                <span className="text-[9px] font-mono font-bold text-purple-500 bg-purple-55 py-0.5 px-1.5 rounded">安全區</span>
                <span className="text-[9px] font-mono font-bold text-yellow-605 bg-yellow-55 py-0.5 px-1.5 rounded">警戒控流區</span>
              </div>
              
              {/* LED Segment Blocks */}
              <div className="grid grid-cols-10 gap-1 w-full h-7 mt-1.5 select-none">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const threshold = (idx + 1) * 10;
                  const isLit = actualPercent >= threshold;
                  
                  // Purple LEDs for normal, Yellow LEDs for warn, red for critical overflow
                  let litBg = "bg-purple-600 shadow-xs shadow-purple-500/30";
                  if (idx >= 8) {
                    litBg = "bg-rose-500 shadow-xs shadow-rose-500/30";
                  } else if (idx >= 6) {
                    litBg = "bg-yellow-500 shadow-xs shadow-yellow-500/30";
                  }
                  
                  return (
                    <div
                      key={idx}
                      className={`h-full rounded-sm transition-all duration-300 ${
                        isLit 
                          ? `${litBg} scale-[1.03]` 
                          : "bg-slate-100/80 border border-slate-200/50"
                      }`}
                      title={`飽和度階梯：${threshold}%`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full text-center mt-5 border-t border-slate-100 pt-3">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-bold border ${statusColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
              現狀品質：{statusText}
            </span>
          </div>
        </div>

        {/* Core Widget 2: Occupancy Status State Card */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group">
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase mb-3 flex items-center justify-between">
              <span>人數狀態</span>
              <Sparkles className="w-4 h-4 text-gray-300" />
            </h3>
            <div className="mt-2 flex items-center gap-3">
              <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${statusBg} text-white shadow-md shadow-purple-500/15`}>
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-850">{statusText}</p>
                <p className="text-xs text-gray-450 mt-0.5 font-mono">容納比率：{actualPercent}%</p>
              </div>
            </div>
            <p className="text-xs text-gray-550 mt-4 leading-relaxed font-sans bg-purple-50/20 p-2.5 rounded-xl border border-purple-100/30">
              {statusDesc}。出門前歡迎用此指標規劃運動，提升行程效率。
            </p>
          </div>
          <button 
            onClick={() => onNavigate("trends")}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center justify-between cursor-pointer group-hover:translate-x-1 transition-transform border-t border-gray-100 pt-3 mt-4"
          >
            <span>人流趨勢歷史分析</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Core Widget 3: AI Smart Tip Panel */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group">
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase mb-3 flex items-center justify-between">
              <span>Smart Tip 智慧建議</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs font-semibold text-purple-600 bg-purple-50 py-1 px-2.5 rounded-lg border border-purple-100 inline-block font-sans mb-3">
              AI 根據當下人流分析：
            </p>
            <p className="text-xs text-gray-600 leading-relaxed font-sans line-clamp-4">
              {actualPercent >= 90
                ? "目前健身房面臨高上限尖峰，建議20:00後進場，或改至「伸展區」進行腹內核心，避開有氧跑步區域。"
                : actualPercent >= 75
                ? "館內有些擁擠，跑步機與臥推架排隊人多。建議選擇去使用利用率較低的伸展拉伸區，或是前往其他空置區域。"
                : actualPercent >= 40
                ? "人數適當，有氧區及重訓區利用度恰到好處，體驗十分流暢，現在正值極佳的綜合體感運動時段！"
                : "健身房極為空置！所有器材皆無需排隊排檔。立刻穿好跑鞋，開啟你今日活力的完美鍛鍊計畫吧。"}
            </p>
          </div>
          <button 
            onClick={() => onNavigate("smart-tip")}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center justify-between cursor-pointer group-hover:translate-x-1 transition-transform border-t border-gray-100 pt-3 mt-4"
          >
            <span>開啟 AI 智慧問答推薦</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Core Widget 4: Traffic Alert and Regulation warning */}
        <div className={`p-5 rounded-3xl shadow-sm flex flex-col justify-between border ${
          actualPercent >= 90 
            ? "bg-red-50/70 border-red-100 text-red-900" 
            : "bg-white border-gray-100"
        }`}>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase mb-2 flex items-center justify-between">
              <span>即刻客滿提醒</span>
              <AlertTriangle className={`w-4 h-4 ${actualPercent >= 90 ? "text-red-500 animate-bounce" : "text-amber-500"}`} />
            </h3>
            <div className="mt-1">
              {actualPercent >= 90 ? (
                <>
                  <p className="text-lg font-extrabold text-red-600 tracking-tight font-sans">
                    已達飽和上限警告！
                  </p>
                  <p className="text-xs text-red-705 leading-relaxed mt-2 font-sans">
                    館內人數已達 <strong>{actualPercent}%</strong>，工讀生將在入口啟動一進一出管制。建議避開尖峰時段或先行確認其他運動場館。
                  </p>
                </>
              ) : actualPercent >= 75 ? (
                <>
                  <p className="text-base font-bold text-slate-805 tracking-tight font-sans">
                    接近管制紅線 (80%)
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2 font-sans">
                    目前進場不需要等待，但部分高頻器材排隊時間大概 5~10 分鐘。如人頭指針超過 90% 將實施人數控管。
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-gray-800 tracking-tight font-sans">
                    進場暢通無阻
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-2 font-sans">
                    容留量安全無虞。工讀生無進出人流限幅。可以安心快速地入館登記！
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100/50">
            <span className={`w-full py-2 px-3 text-xs font-semibold rounded-2xl flex items-center justify-center ${
              actualPercent >= 75 
                ? "bg-yellow-500 hover:bg-yellow-600 text-gray-950 shadow-sm font-bold" 
                : "bg-purple-50 text-purple-700 border border-purple-100"
            }`}>
              {actualPercent >= 90 ? "現場已實施人流管制" : actualPercent >= 75 ? "即將啟動管制" : "非管制時段"}
            </span>
          </div>
        </div>

      </section>

      {/* Main Graph & Floor Area Row */}
      <section className="max-w-7xl mx-auto mb-8">
        
        {/* Row Element 1: Recharts Hourly Traffic Curves (Full Width) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm w-full font-sans">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-855 flex items-center gap-1.5 font-sans">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span>人流趨勢 (今日)</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">顯示目前每小時在館人數與昨日同期對比</p>
            </div>
            
            <div className="flex gap-4 text-xs font-mono">
              <span className="flex items-center text-purple-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-1.5 animate-pulse"></span>
                今日人數
              </span>
              <span className="flex items-center text-yellow-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5"></span>
                昨日人數
              </span>
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAF5FF" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, state.maxLimit]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#581C87", // Purple theme tooltip background
                    borderRadius: "12px", 
                    border: "none", 
                    color: "#fff",
                    fontSize: "12px",
                    fontFamily: "sans-serif"
                  }} 
                />
                <ReferenceLine 
                  y={state.maxLimit * 0.9} 
                  stroke="#EF4444" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: `客滿警戒線 (${Math.round(state.maxLimit * 0.9)}人 / 90%)`, 
                    fill: '#EF4444', 
                    fontSize: 10, 
                    position: 'insideTopLeft' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="今日人數" 
                  stroke="#9333EA" // Purple-600 primary line
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 1, fill: "#9333EA" }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="昨日人數" 
                  stroke="#EAB308" // Amarillo / Yellow-500 for auxiliary line representation
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>

      {/* Mini Recent faulty Equipments / Announcements Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        
        {/* Left Side: Recent Faulty Equipments List (1 span) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group">
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5 font-sans">
                <Wrench className="w-4.5 h-4.5 text-purple-600" />
                <span>故障器材</span>
              </h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-xl border border-amber-200">
                {state.equipments.filter(e => e.status !== "已修復").length} 件待理
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">掌握堪用設施狀態，避免撲空白跑</p>

            <div className="space-y-3">
              {state.equipments.slice(0, 3).map(equip => {
                let statusCol = "bg-red-50 text-red-655 border-red-100";
                if (equip.status === "維修中") {
                  statusCol = "bg-amber-50 text-amber-600 border-amber-100";
                } else if (equip.status === "已修復") {
                  statusCol = "bg-green-50 text-green-600 border-green-100";
                }
                return (
                  <div key={equip.id} className="flex p-2 rounded-xl border border-gray-105 hover:bg-purple-50/20 items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-700 truncate">{equip.name}</p>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate">{equip.location} | 回報: {equip.reportTime.split(" ")[0]}</p>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${statusCol}`}>
                        {equip.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onNavigate("equipments")}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center justify-between cursor-pointer group-hover:translate-x-1 transition-transform border-t border-gray-100 pt-3 mt-4"
          >
            <span>檢視全部器材修繕紀錄</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Quick Announcements Callout list (1 span) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group">
          <div className="w-full">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5 font-sans mb-1">
              <Megaphone className="w-4.5 h-4.5 text-purple-600" />
              <span>公告資訊</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">掌握體育室開館、清潔或調整最新資訊</p>

            <div className="bg-purple-50/30 border border-purple-100 border-dashed p-3.5 rounded-2xl relative">
              {state.announcements.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-mono text-gray-400 font-bold">{state.announcements[0].date}</span>
                    {state.announcements[0].isNew && (
                      <span className="bg-purple-600 text-white text-[9px] font-black tracking-wide px-1.5 py-0.5 rounded uppercase font-sans">NEW</span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-gray-600 font-sans line-clamp-4">
                    {state.announcements[0].content}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4 font-sans italic">當前尚無最新公告通知。</p>
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigate("announcements")}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center justify-between cursor-pointer group-hover:translate-x-1 transition-transform border-t border-gray-100 pt-3 mt-4"
          >
            <span>展開全部公告大事紀</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </section>

    </div>
  );
}
