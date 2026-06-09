import React, { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  Users, 
  TrendingUp, 
  Wrench, 
  ShieldAlert, 
  Clock, 
  Zap,
  Activity,
  MessageSquare,
  Trash2
} from "lucide-react";

interface AdminHomeProps {
  state: GymStateSnapshot;
  handleFeedbackReply: (feedbackId: string, reply: string) => Promise<boolean>;
  handleFeedbackDelete: (feedbackId: string) => Promise<boolean>;
}

export default function AdminHome({ 
  state,
  handleFeedbackReply,
  handleFeedbackDelete
}: AdminHomeProps) {
  const actualPercent = Math.round((state.currentOccupancy / state.maxLimit) * 100);
  const faultyCount = state.equipments.filter(e => e.status !== "已修復").length;
  const criticalFeedbacks = state.feedbacks ? state.feedbacks.filter(f => !f.reply).length : 0;

  // Local state for feedback replies
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({});
  const [isRepLoading, setIsRepLoading] = useState<string | null>(null);

  const mockHourLabels = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

  const handleReplySubmit = async (feedbackId: string) => {
    const text = replyTexts[feedbackId]?.trim();
    if (!text) return;

    setIsRepLoading(feedbackId);
    try {
      const ok = await handleFeedbackReply(feedbackId, text);
      if (ok) {
        setReplyTexts(prev => ({ ...prev, [feedbackId]: "" }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRepLoading(null);
    }
  };

  return (
    <div className="space-y-6 select-none bg-white p-2">
      
      {/* 4 Multi-colored metrics cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Live Occupancy */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400">目前在館人數</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800">{state.currentOccupancy}</span>
              <span className="text-xs text-slate-400 font-mono">/ {state.maxLimit} max</span>
            </div>
            <p className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>即時飽和比：{actualPercent}%</span>
            </p>
          </div>
          <div className="bg-purple-50 p-3.5 rounded-2xl text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Health of Equipments */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400">待處理故障器材</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800">{faultyCount}</span>
              <span className="text-xs text-slate-400 font-mono">/ {state.equipments.length} 總件</span>
            </div>
            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              <span>維修作業進行中</span>
            </p>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Feedback queue */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400">待覆回覆留言</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-805">{criticalFeedbacks}</span>
              <span className="text-xs text-slate-400 font-mono">件待辦</span>
            </div>
            <p className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>本週學生意見反映</span>
            </p>
          </div>
          <div className="bg-red-50 p-3.5 rounded-2xl text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Peak Hours Prediction */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400">高峰預期時段</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-805 font-sans">18:00-21:00</span>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>平均停留 2.6 小時</span>
            </p>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </section>

      {/* Main Row layout for charts and metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Graphical dashboard section (Col 1, 2 & 3) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm md:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-purple-600" />
                <span>24小時體育館人流湧動大盤走勢</span>
              </h3>
              <p className="text-[11px] text-slate-400">即時串流顯示今日與昨日整點在館人數之變動特徵</p>
            </div>
            <div className="flex gap-3 text-[10px] font-sans font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-600 rounded-full inline-block"></span>今日歷史點</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-450 rounded-full inline-block"></span>昨日軌跡</span>
            </div>
          </div>

          {/* SVG based Premium Render plot */}
          <div className="relative bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex flex-col justify-between h-64 font-mono">
            
            {/* Background grid lines */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none opacity-45">
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
            </div>

            {/* Simulated Line Plot with smooth curve segments */}
            <div className="relative w-full h-full flex items-end">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* Yesterday fill gradient */}
                <path
                  d="M 10 180 L 10 136.8 L 80 79.2 L 150 82.8 L 220 100.8 L 290 68.4 L 360 43.2 L 430 7.2 L 490 126 L 490 180 Z"
                  fill="url(#yesterdayGrad)"
                  opacity="0.08"
                />
                <path
                  d="M 10 136.8 Q 80 79.2 150 82.8 T 220 100.8 T 290 68.4 T 360 43.2 T 430 7.2 T 490 126"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                
                {/* Today fill gradient */}
                <path
                  d="M 10 185 L 10 126 L 80 97.2 M 80 97.2 L 150 72 M 150 72 L 220 115.2 M 220 115.2 L 290 90 M 290 90 L 360 18 M 360 18 L 430 28.8 M 430 28.8 L 490 144 L 490 185 Z"
                  fill="url(#todayGrad)"
                  opacity="0.12"
                />
                <path
                  d="M 10 126 Q 80 97.2 150 72 T 220 115.2 T 290 90 T 360 18 T 430 28.8 T 490 144"
                  fill="none"
                  stroke="#9333EA"
                  strokeWidth="3.5"
                />

                {/* Definitions */}
                <defs>
                  <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333EA" />
                    <stop offset="100%" stopColor="#f5f3ff" />
                  </linearGradient>
                  <linearGradient id="yesterdayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#fef3c7" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Graphical nodes */}
              <div className="absolute left-[70%] bottom-[88%] bg-purple-650 text-white font-sans text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-md animate-bounce">
                高峰: 45人
              </div>
            </div>

            {/* Labels under graph */}
            <div className="flex justify-between text-[9px] text-slate-400 border-t border-slate-200/65 pt-2 font-mono mt-2 z-10 bg-white/45">
              {mockHourLabels.map(l => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Row 3: Feedbacks list moderation panel (Student Feedback) */}
      <section className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans">
            <MessageSquare className="w-4.5 h-4.5 text-purple-600 animate-pulse" />
            <span>學生意見與故障回報管理</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">審閱同學們提交的意見、留言或故障回報案，提供官方答覆或下架不當留言</p>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {state.feedbacks && state.feedbacks.length > 0 ? (
            state.feedbacks.map(f => {
              let badgeStyle = "bg-purple-50 text-purple-600 border-purple-150";
              if (f.type === "問題回報") {
                badgeStyle = "bg-red-50 text-red-655 border-red-150";
              } else if (f.type === "建議事項") {
                badgeStyle = "bg-amber-50 text-amber-650 border-amber-150";
              }

              return (
                <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:bg-slate-100/30 transition-all font-sans relative">
                  {/* Metadata labels */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-lg border font-bold ${badgeStyle}`}>
                        {f.type}
                      </span>
                      <span className="bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-lg border border-slate-300">
                        {f.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono font-medium flex items-center gap-2">
                      <span>同學稱呼: <strong className="text-gray-600 font-bold">{f.username}</strong></span>
                      <span>|</span>
                      <span>發表時間: {f.timestamp}</span>
                    </div>
                  </div>

                  {/* Body text */}
                  <p className="text-xs text-slate-700 leading-relaxed font-sans bg-white p-3.5 rounded-xl border border-slate-150 select-text font-medium">
                    {f.content}
                  </p>

                  {/* Reply Input block */}
                  <div className="mt-3.5 border-t border-dashed border-slate-200/80 pt-3.5 flex flex-col md:flex-row gap-3 items-end">
                    
                    <div className="flex-1 w-full text-xs">
                      {f.reply ? (
                        <div className="bg-purple-50/30 border border-purple-100 p-3 rounded-xl select-text">
                          <span className="font-bold text-purple-700 text-[10px] block">已回覆內容：</span>
                          <p className="text-slate-600 mt-1 leading-relaxed text-xs">{f.reply}</p>
                        </div>
                      ) : (
                        <div className="text-gray-400 italic text-[11px] font-sans pb-1 flex items-center gap-1 select-none">
                          <span>● 尚無答覆。請於下方框內輸入內容以 Google 身分回覆：</span>
                        </div>
                      )}

                      <div className="flex gap-2 mt-2 w-full">
                        <input
                          type="text"
                          value={replyTexts[f.id] || ""}
                          onChange={(e) => setReplyTexts(prev => ({ ...prev, [f.id]: e.target.value }))}
                          placeholder={f.reply ? "修改回覆或重新編輯..." : "請輸入體育室工讀生官方回覆..."}
                          className="bg-white border border-slate-250 focus:border-purple-500 rounded-xl px-3 py-1.5 outline-none text-xs text-slate-800 flex-1 transition-all"
                        />
                        <button
                          type="button"
                          disabled={isRepLoading === f.id || !(replyTexts[f.id]?.trim())}
                          onClick={() => handleReplySubmit(f.id)}
                          className={`px-4 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            !(replyTexts[f.id]?.trim())
                              ? "bg-gray-105 text-gray-400 border-gray-250 cursor-not-allowed"
                              : "bg-purple-600 text-white border-purple-500 hover:bg-purple-700"
                          }`}
                        >
                          {isRepLoading === f.id ? "送出中..." : f.reply ? "修改回覆" : "提交回覆"}
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => handleFeedbackDelete(f.id)}
                        className="bg-red-50 hover:bg-red-105 border border-red-250 text-red-650 p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        title="下架此留言"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>下架留言</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-gray-400 font-sans italic">
              目前尚無同學提出的意見留言。
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
