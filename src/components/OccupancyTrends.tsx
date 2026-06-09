import { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  TrendingUp, 
  Calendar, 
  FileSpreadsheet, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from "recharts";

interface OccupancyTrendsProps {
  state: GymStateSnapshot;
}

export default function OccupancyTrends({ state }: OccupancyTrendsProps) {
  const [timeTab, setTimeTab] = useState<"today" | "week" | "month">("today");
  const [dataResolution, setDataResolution] = useState<"15min" | "30min" | "1hour">("1hour");

  // Mocked weekly statistics
  const weeklyData = [
    { name: "週一", "本週人數": 210, "上週平均": 190 },
    { name: "週二", "本週人數": 245, "上週平均": 220 },
    { name: "週三", "本週人數": 278, "上週平均": 240 },
    { name: "週四", "本週人數": 256, "上週平均": 230 },
    { name: "週五", "本週人數": 230, "上週平均": 250 },
    { name: "週六", "本週人數": 140, "上週平均": 150 },
    { name: "週日", "本週人數": 110, "上週平均": 120 }
  ];

  // Mocked monthly statistics
  const monthlyData = [
    { name: "第1週", "本月人流量": 1200, "上月人流量": 1100 },
    { name: "第2週", "本月人流量": 1450, "上月人流量": 1300 },
    { name: "第3週", "本月人流量": 1600, "上月人流量": 1500 },
    { name: "第4週", "本月人流量": 1380, "上月人流量": 1420 }
  ];

  // Raw interactive today data
  const todayRawData = state.hourlyHistory.map((val, idx) => ({
    time: `${String(idx).padStart(2, "0")}:00`,
    "今日人數": val,
    "昨日人數": state.yesterdayHourlyHistory[idx] || 0
  }));

  // Resolve active chart dataset
  let activeChartData: any[] = [];
  if (timeTab === "today") {
    activeChartData = todayRawData;
  } else if (timeTab === "week") {
    activeChartData = weeklyData;
  } else {
    activeChartData = monthlyData;
  }

  // Statistics block calculations
  const totalCheckInsToday = 256;
  const avgStayTime = 2.6; // hours
  const peakTimeStr = "18:00 - 21:00";
  const worstOccupancy = Math.max(...state.hourlyHistory);
  const lowestTimeStr = "09:00 - 11:05";
  const lowestAvgOccupancy = 18;

  // Table intervals generator for visual display at bottom
  const intervalsTable = [
    { range: "00:00 - 03:00", avg: 6, rate: 12, flag: "green" },
    { range: "03:00 - 06:00", avg: 8, rate: 16, flag: "green" },
    { range: "06:00 - 09:00", avg: 15, rate: 30, flag: "blue" },
    { range: "09:00 - 12:00", avg: 22, rate: 44, flag: "blue" },
    { range: "12:00 - 15:00", avg: 30, rate: 60, flag: "orange" },
    { range: "15:00 - 18:00", avg: 38, rate: 76, flag: "orange" },
    { range: "18:00 - 21:00", avg: 48, rate: 96, flag: "red" },
    { range: "21:00 - 24:00", avg: 28, rate: 56, flag: "blue" }
  ];

  // Helper trigger to save CSV mockup
  const handleExportCSV = () => {
    alert("「人流趨勢報表已準備就緒」\n點擊確認即可下載統計報表 CSV 檔案 (NCU_Gym_Report.csv)。");
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white select-none">
      
      {/* Top Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 max-w-7xl mx-auto gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-950 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>人流趨勢</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            提供詳盡、可導出的人潮熱點統計，輔助預防器材排隊和管理人手調度
          </p>
        </div>

        {/* Date Selector and Download controls */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <div className="bg-white px-3 py-2 rounded-xl border border-gray-150 inline-flex items-center gap-2 text-xs font-mono font-bold text-gray-750">
            <Calendar className="w-4 h-4 text-gray-450" />
            <span>2026/05/22 (五)</span>
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="bg-purple-600 hover:bg-purple-700 text-white font-sans text-xs font-bold py-2 px-4 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 shrink-0 shadow-purple-650/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>匯出報表</span>
          </button>
        </div>
      </header>

      {/* Tabs Row Indicator */}
      <div className="max-w-7xl mx-auto mb-6 bg-white p-1 rounded-2xl border border-gray-105 flex justify-between items-center flex-wrap gap-2 shadow-sm">
        <div className="flex gap-1.5">
          <button
            onClick={() => setTimeTab("today")}
            className={`py-2 px-4 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
              timeTab === "today" ? "bg-purple-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            今日趨勢
          </button>
          <button
            onClick={() => setTimeTab("week")}
            className={`py-2 px-4 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
              timeTab === "week" ? "bg-purple-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            本週趨勢
          </button>
          <button
            onClick={() => setTimeTab("month")}
            className={`py-2 px-4 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
              timeTab === "month" ? "bg-purple-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            本月趨勢
          </button>
        </div>

        {/* Resolution segment controller for Today only */}
        {timeTab === "today" && (
          <div className="flex items-center bg-gray-150 p-0.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setDataResolution("15min")}
              className={`p-1 px-3.5 text-[10px] font-bold rounded-lg cursor-pointer ${
                dataResolution === "15min" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-650"
              }`}
            >
              15 分鐘
            </button>
            <button
              onClick={() => setDataResolution("30min")}
              className={`p-1 px-3.5 text-[10px] font-bold rounded-lg cursor-pointer ${
                dataResolution === "30min" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-655"
              }`}
            >
              30 分鐘
            </button>
            <button
              onClick={() => setDataResolution("1hour")}
              className={`p-1 px-3.5 text-[10px] font-bold rounded-lg cursor-pointer ${
                dataResolution === "1hour" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-655"
              }`}
            >
              1 小時
            </button>
          </div>
        )}
      </div>

      {/* Analytics Bento Info Boxes Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 max-w-7xl mx-auto mb-6">
        
        {/* Stat item 1 */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider">今日總進場人次</p>
            <p className="text-2xl font-black font-sans text-gray-800 tracking-tight mt-1">{totalCheckInsToday} <span className="text-xs font-semibold text-gray-450">&nbsp;人次</span></p>
          </div>
          <div className="mt-3 flex items-center font-mono text-[10px] gap-1 text-green-600 bg-green-50/50 py-1 px-2.5 rounded-lg border border-green-100 w-fit">
            <ArrowDownRight className="w-4 h-4" />
            <span>昨日 312 人次 (-17.9%)</span>
          </div>
        </div>

        {/* Stat item 2 */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider">目前館內人數</p>
            <p className="text-2xl font-black font-sans text-gray-800 tracking-tight mt-1">{state.currentOccupancy} <span className="text-xs font-semibold text-gray-450">&nbsp;人</span></p>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${state.currentOccupancy >= 45 ? "bg-red-500" : state.currentOccupancy >= 38 ? "bg-amber-500" : "bg-purple-600"}`} 
                style={{ width: `${(state.currentOccupancy / state.maxLimit) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] font-mono font-bold text-gray-400">
              <span>飽和上限：{state.maxLimit} 人</span>
              <span>{Math.round((state.currentOccupancy/state.maxLimit)*100)}%</span>
            </div>
          </div>
        </div>

        {/* Stat item 3 */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider">今日尖峰時段</p>
            <p className="text-base font-black font-sans text-gray-800 tracking-tight mt-1.5 leading-tight">{peakTimeStr}</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-red-650 font-sans font-semibold bg-red-50 py-1 px-2 rounded-lg border border-red-100 w-fit">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>最高達到 {worstOccupancy} 人 (極為擁堵)</span>
          </div>
        </div>

        {/* Stat item 4 */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider">平均停留時間</p>
            <p className="text-2xl font-black font-sans text-gray-800 tracking-tight mt-1">{avgStayTime} <span className="text-xs font-semibold text-gray-450">&nbsp;小時</span></p>
          </div>
          <div className="mt-3 flex items-center font-mono text-[10px] gap-1 text-green-600 bg-green-50/50 py-1 px-2.5 rounded-lg border border-green-100 w-fit">
            <ArrowDownRight className="w-4 h-4" />
            <span>昨日 2.8 小時 (-7.1%)</span>
          </div>
        </div>

        {/* Stat item 5 */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider">今日離峰時段</p>
            <p className="text-base font-black font-sans text-gray-800 tracking-tight mt-1.5 leading-tight">{lowestTimeStr}</p>
          </div>
          <div className="mt-3 text-[10px] font-sans font-semibold text-green-600 bg-green-50/50 py-1 px-2.5 border border-green-100 rounded-lg w-fit">
            平均僅約 {lowestAvgOccupancy} 人
          </div>
        </div>

        {/* Stat item 6 */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider">今日滿場次數</p>
            <p className="text-2xl font-black font-sans text-gray-800 tracking-tight mt-1">1 <span className="text-xs font-semibold text-gray-450">&nbsp;次</span></p>
          </div>
          <div className="mt-3 flex items-center font-mono text-[10px] gap-1 text-green-600 bg-green-50/50 py-1 px-2.5 rounded-lg border border-green-100 w-fit">
            <ArrowDownRight className="w-4 h-4" />
            <span>昨日 2 次 (-50.0%)</span>
          </div>
        </div>

      </section>

      {/* Main Big Chart Card */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-855 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>
                {timeTab === "today" ? `人流趨勢詳細剖析 (今日)` : timeTab === "week" ? "每週人流走勢對比" : "月度人流量走勢"}
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">預約人或常客可用於迴避塞車的高危期</p>
          </div>

          <div className="flex select-none gap-4 text-xs font-mono">
            {timeTab === "today" ? (
              <>
                <span className="flex items-center text-purple-650 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-1.5 animate-pulse"></span>
                  今日人數
                </span>
                <span className="flex items-center text-amber-500 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
                  昨日相對人數
                </span>
              </>
            ) : timeTab === "week" ? (
              <>
                <span className="flex items-center text-purple-650 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-1.5 animate-pulse"></span>
                  本週人數
                </span>
                <span className="flex items-center text-amber-500 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
                  上週同期平均
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center text-purple-650 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-1.5 animate-pulse"></span>
                  本月累計人流
                </span>
                <span className="flex items-center text-amber-500 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
                  上月同期
                </span>
              </>
            )}
          </div>
        </div>

        {/* Area Map rendering Recharts */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333EA" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#9333EA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F3FF" />
              <XAxis 
                dataKey={timeTab === "today" ? "time" : "name"} 
                stroke="#94A3B8" 
                fontSize={10.5} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={10.5} 
                tickLine={false} 
                axisLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#581C87", 
                  borderRadius: "16px", 
                  border: "none", 
                  color: "#fff",
                  fontSize: "12px",
                  fontFamily: "sans-serif"
                }} 
              />
              <ReferenceLine y={45} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '客滿飽和警戒度 (90%)', fill: '#EF4444', fontSize: 10, position: 'insideTopLeft' }} />
              <Area 
                type="monotone" 
                dataKey={timeTab === "today" ? "今日人數" : timeTab === "week" ? "本週人數" : "本月人流量"} 
                stroke="#9333EA" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#gradientActive)" 
              />
              <Area 
                type="monotone" 
                dataKey={timeTab === "today" ? "昨日人數" : timeTab === "week" ? "上週平均" : "上月人流量"} 
                stroke="#F59E0B" 
                strokeWidth={2} 
                fill="none" 
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Interval Stats Subgrid table card */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm max-w-7xl mx-auto p-6">
        <h3 className="text-base font-bold text-gray-850 flex items-center gap-2 mb-1.5">
          <Clock className="w-4.5 h-4.5 text-purple-600" />
          <span>各時段人數統計</span>
        </h3>
        <p className="text-xs text-gray-400 mb-5">預設對當天區塊細分的即時及往年平均人流統計與飽和度分析</p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left border-collapse text-sm select-none">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-mono text-xs">
                <th className="py-3 px-5 font-bold">時段</th>
                <th className="py-3 px-5 font-bold">平均在館人數</th>
                <th className="py-3 px-5 font-bold">平均使用率佔比 %</th>
                <th className="py-3 px-5 font-bold">狀態擁塞說明</th>
              </tr>
            </thead>
            <tbody>
              {intervalsTable.map((it, idx) => {
                let badgeClass = "text-green-600 bg-green-50 border-green-100";
                let badgeLabel = "場館空閒";
                if (it.flag === "red") {
                  badgeClass = "text-red-650 bg-red-50 border-red-155 animate-pulse font-bold";
                  badgeLabel = "極度擁擠";
                } else if (it.flag === "orange") {
                  badgeClass = "text-amber-600 bg-amber-50 border-amber-100";
                  badgeLabel = "使用人數適中";
                } else if (it.flag === "blue") {
                  badgeClass = "text-purple-650 bg-purple-50 border-purple-100";
                  badgeLabel = "清爽適中";
                }
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-purple-50/20 text-gray-700 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-gray-800">{it.range}</td>
                    <td className="py-3.5 px-5 font-mono">{it.avg} 人</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-gray-500 w-10">{it.rate}%</span>
                        <div className="w-24 bg-gray-105 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${it.rate >= 90 ? "bg-red-500" : it.rate >= 60 ? "bg-amber-400" : "bg-purple-600"}`}
                            style={{ width: `${it.rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-xl text-xs border inline-block ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
