import { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  Brain, 
  Sparkles, 
  Clock, 
  MapPin, 
  Activity, 
  User, 
  MessageSquare, 
  Send, 
  Loader2 
} from "lucide-react";

interface SmartTipsViewProps {
  state: GymStateSnapshot;
}

interface AIPredictionResponse {
  smartTip: string;
  detailedAnalysis: string;
  personalAdvice: string;
  recommendations: string[];
}

export default function SmartTipsView({ state }: SmartTipsViewProps) {
  const [customPrefs, setCustomPrefs] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiData, setAiData] = useState<AIPredictionResponse | null>(null);

  // Simulation block simulating quick API proxy fetch that would happen in production
  const fetchAIPredictions = (inputQuery: string) => {
    setIsLoading(true);
    setTimeout(() => {
      // Custom dynamic rules based on user keywords
      let computedTip = "目前館內人潮適中，建議優先使用伸展拉伸區或自由重量區進行循環訓練。";
      let detailed = "依據即時數據，有氧區使用率約 68% 稍微緊湊，但重訓室與力量機械均十分寬裕，完全可以專注於阻力或肌肉鍛鍊。";
      let personal = "根據您的日常偏好，本時段各器械配置優良，若希望達到最高燃脂效率，可優先進行阻力與全身循環訓練！";
      let recommendations = [
        "優先使用空置率較高的有氧區橢圓交叉機",
        "可多利用重訓室的多功能史密斯架做阻力進階",
        "避開 18:00 - 21:00 體育系常規重訓集訓課"
      ];

      if (inputQuery.includes("有氧") || inputQuery.includes("慢跑") || inputQuery.includes("跑步")) {
        computedTip = "為您推薦有氧耐力優先配比！今日有氧器材妥善率達到 92% 空氣對流亦調至最佳。";
        detailed = "如果您熱愛有氧高密度鍛鍊，此時橢圓機、划船機皆為閒置黃金態，可以直接進場無縫銜接。";
      } else if (inputQuery.includes("重訓") || inputQuery.includes("深蹲") || inputQuery.includes("槓鈴")) {
        computedTip = "力量訓練高潮期指引！此時自由重量區配額空閒度約為 58%。";
        detailed = "多用途高承重啞鈴、複合式史密斯機目前排隊秒數小於 2 分鐘，適合進行多組超負荷大重量提升。";
      }

      setAiData({
        smartTip: computedTip,
        detailedAnalysis: detailed,
        personalAdvice: personal,
        recommendations: recommendations
      });
      setIsLoading(false);
    }, 1300);
  };

  const actualPercentage = Math.round((state.currentOccupancy / state.maxLimit) * 100);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white select-none">
      
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 max-w-7xl mx-auto gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-950 tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Smart Tip 智慧建議專區</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            整合場館當前即時情況與歷史排隊模型，提供您的校園健身行程最佳指引。
          </p>
        </div>
      </header>

      {/* Top Banner Stat Summary */}
      <div className="bg-gradient-to-r from-purple-650 via-purple-700 to-purple-850 text-white p-5 rounded-3xl shadow-md max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-48 h-48 select-none">
          <Sparkles className="w-full h-full" />
        </div>

        <div className="max-w-2xl">
          <div className="flex items-center gap-2 bg-white/10 w-fit py-1 px-3 rounded-full border border-white/15 text-xs font-mono tracking-wider font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>當前 AI 動態核心偵測</span>
          </div>
          <p className="text-base font-semibold leading-relaxed font-sans mb-1">
            {aiData?.smartTip || "現在非常適合運動！目前人數適中，建議優先使用伸展區或自由重量區。"}
          </p>
          <p className="text-xs text-purple-200 leading-relaxed font-sans opacity-85">
            {aiData?.detailedAnalysis || "體育館有氧設備目前較為緊湊，不過自由重量區和力量機械仍保有極佳的空置空間，您完全可以流暢進行多重全身循環。"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0 bg-white/5 py-2.5 px-4 rounded-2xl border border-white/10 font-mono text-center">
          <div>
            <span className="text-[10px] text-purple-200 block uppercase font-bold">場館目前人數</span>
            <span className="text-2xl font-black">{state.currentOccupancy}人</span>
          </div>
          <div>
            <span className="text-[10px] text-purple-200 block uppercase font-bold">飽和使用度</span>
            <span className="text-2xl font-black">{actualPercentage}%</span>
          </div>
        </div>
      </div>

      {/* AI Wisdom Suggestion Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto mb-8">
        
        {/* Card 1: Off-Peak suggestions */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-500 border border-amber-100 shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-bold text-gray-805 font-sans">離峰時段建議</h4>
            </div>
            <p className="text-[11px] font-mono font-bold text-[10px] text-amber-600 bg-amber-50/50 py-1 px-2.5 border border-amber-100 rounded-lg inline-block select-none mb-3">
              建議避開 18:00 - 21:00
            </p>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              歷史回顧曲線提示，週五及大一新生入班課餘之放學（17:30 - 19:30）為全天最高飽和時段，建議彈性調整至「上午 08:00 - 10:00」或「晚餐後 21:00」進館。
            </p>
          </div>
        </div>

        {/* Card 2: Region suggestion */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-100 shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-bold text-gray-805 font-sans">區域使用建議</h4>
            </div>
            <p className="text-[11px] font-mono font-bold text-[10px] text-purple-600 bg-purple-50/30 border border-purple-100 rounded-lg inline-block select-none mb-3">
              自由重量區、伸展區
            </p>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              依據入口紅外線及重訓室內壓力感應，當前「伸展拉伸區」及「自由重量區」使用率僅分別為 18% 和 32% ，非常有利於全身有氧開展度或高密度槓鈴訓練。
            </p>
          </div>
        </div>

        {/* Card 3: Facilities details */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500 border border-emerald-100 shrink-0">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-bold text-gray-805 font-sans">器材推薦空間率</h4>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-650">橢圓交叉機 (有氧區)</span>
                <span className="font-mono text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1.5 rounded font-bold">空置率 82%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-650">划船模擬機 (有氧區)</span>
                <span className="font-mono text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1.5 rounded font-bold">空置率 76%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-650">多功能史密斯 (重訓區)</span>
                <span className="font-mono text-amber-500 bg-amber-50 border border-amber-100/50 px-1.5 rounded font-bold">空置率 45%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              有氧跑步機3號、深蹲架仍在修復中。建議使用橢圓交叉機、史密斯架作為流暢補充，阻隔等待感。
            </p>
          </div>
        </div>

        {/* Card 4: Personalized AI advices */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-150 shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-bold text-gray-805 font-sans">客製化個人建議</h4>
            </div>
            <p className="text-xs text-purple-605 leading-relaxed font-sans mb-3 font-semibold">
              {aiData?.personalAdvice ? "AI 專屬量身分析中" : "結合您的日常偏好提供調度"}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              {aiData?.personalAdvice || "如果您平時多在一點半 or 兩點運動，該區間屬於中大健身房的午間黃金低人流帶，重訓與有氧使用度皆極高體驗，可放心前往！"}
            </p>
          </div>
        </div>

      </section>

      {/* Real AI Preferences Interactive consulting Station */}
      <section className="max-w-7xl mx-auto">
        
        {/* Ask panel Form (Full Width) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm w-full flex flex-col justify-between">
          <div className="w-full">
            <h3 className="text-base font-bold text-gray-850 flex items-center gap-2 font-sans mb-1.5">
              <MessageSquare className="w-4.5 h-4.5 text-purple-600" />
              <span>與 AI 進排程規劃諮詢</span>
            </h3>
            <p className="text-xs text-gray-400 mb-5 font-sans">
              有些特別的運動時間或喜歡的器材位置？在下方輸入，Gymini 將立即結合目前健身房人流和故障狀況為您做深度回饋！
            </p>

            <form onSubmit={(e) => { e.preventDefault(); if (customPrefs.trim()) fetchAIPredictions(customPrefs); }} className="space-y-4">
              <div className="relative">
                <textarea
                  value={customPrefs}
                  onChange={(e) => setCustomPrefs(e.target.value)}
                  placeholder="例如：我一般打算在每週一下午 6:30 去，想在有氧區跑步機做 45 分鐘有氧，接着去重訓，有適合的建議嗎？或者此時是否容易客滿？"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:bg-white rounded-2xl p-4 text-xs text-slate-800 outline-none transition-all placeholder-slate-400 font-sans"
                  style={{ minHeight: "100px" }}
                ></textarea>
              </div>

              <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-2xl border border-slate-105">
                <span className="text-[10px] text-slate-400 font-mono">
                  NCU Gym Smart Tip Core Powered by Gemini Model
                </span>
                <button
                  type="submit"
                  disabled={isLoading || !customPrefs.trim()}
                  className={`py-2 px-5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                    isLoading || !customPrefs.trim()
                      ? "bg-gray-150 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/10 hover:scale-[1.02]"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在分析中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>送出諮詢</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Render Bespoke Response */}
          {aiData && (customPrefs.trim() || aiData.personalAdvice) && (
            <div className="mt-6 border-t border-dashed border-gray-150 pt-5 animate-fade-in">
              <div className="bg-purple-50/20 border border-purple-100/50 p-4.5 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">AI</div>
                  <span className="text-xs font-bold text-slate-800 font-sans">運動顧問專屬回饋：</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line mb-3.5">
                  {aiData.personalAdvice || aiData.detailedAnalysis}
                </p>

                {aiData.recommendations && aiData.recommendations.length > 0 && (
                  <div className="space-y-1.5 font-sans text-xs">
                    <p className="font-bold text-slate-700">📌 行程微調推薦項目：</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1.5 text-[11px]">
                      {aiData.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
