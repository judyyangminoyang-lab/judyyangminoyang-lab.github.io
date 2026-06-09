import React, { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  PlusCircle, 
  User, 
  Clock, 
  MessageCircle,
  Tag,
  ShieldCheck
} from "lucide-react";

interface FeedbackBoardViewProps {
  state: GymStateSnapshot;
  onUpdateState: (newSnapshot: GymStateSnapshot) => void;
}

export default function FeedbackBoardView({ state, onUpdateState }: FeedbackBoardViewProps) {
  const [username, setUsername] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [type, setType] = useState<string>("問題回報");
  const [category, setCategory] = useState<string>("重訓區");
  const [content, setContent] = useState<string>("");
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Filter feedbacks categories or search
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const finalUsername = isAnonymous ? "匿名同學" : username.trim();
    if (!finalUsername) {
      setErrorMsg("請輸入留言稱呼或選擇匿名發表。");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("請輸入留言回報內容。");
      return;
    }

    setIsSubmitLoading(true);

    try {
      const res = await fetch("/api/state/feedback/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: finalUsername,
          type,
          category,
          content: content.trim()
        })
      });

      const data = await res.json();
      if (data && data.success) {
        onUpdateState(data.state);
        setSuccessMsg("您的意見與故障回報已成功送出！工讀生巡視時會盡快為您答覆。");
        // Reset inputs
        if (!isAnonymous) setUsername("");
        setContent("");
      } else {
        setErrorMsg("發表失敗，請再試一次。");
      }
    } catch (err) {
      console.error("Failed to post feedback:", err);
      setErrorMsg("網路錯誤，無法送出留言。");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const filteredFeedbacks = state.feedbacks ? state.feedbacks.filter(f => {
    if (selectedTypeFilter === "all") return true;
    return f.type === selectedTypeFilter;
  }) : [];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white select-none">
      
      {/* View Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 max-w-7xl mx-auto gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-950 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <span>學生意見回報與留言板</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            提供中大健身房的器材損壞回報、環境清潔建議以及一般健身回饋，館內值勤工讀生會於 24 小時內落案答覆！
          </p>
        </div>
      </header>

      {/* Grid Layout splits: Left is submission form, Right is scrollable comments thread list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* Left Side: Submission Panel Column (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans mb-1">
                <PlusCircle className="w-4.5 h-4.5 text-purple-600" />
                <span>撰寫新留言/回報案</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-sans mb-5">請盡可能詳實填寫，以便工讀生能按圖索驥定位修繕器材</p>

              {successMsg && (
                <div className="mb-4 bg-green-50 border border-green-150 p-3.5 rounded-2xl text-xs text-green-700 flex items-start gap-2 animate-zoom-in">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-4 bg-red-50 border border-red-150 p-3.5 rounded-2xl text-xs text-red-700 flex items-start gap-2 animate-zoom-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                {/* Peer Student Name Or Anonymous */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex justify-between items-center">
                    <span>您的稱呼</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAnonymous(!isAnonymous);
                        if (!isAnonymous) setUsername("");
                      }}
                      className={`text-[10px] font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        isAnonymous 
                          ? "bg-purple-50 border-purple-150 text-purple-600" 
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>{isAnonymous ? "已設為匿名" : "改為匿名發表"}</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isAnonymous ? "匿名同學" : "中文或英文字母 (如: 王同學)"}
                    className={`w-full bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl p-2.5 outline-none focus:bg-white transition-all text-xs font-sans ${
                      isAnonymous ? "opacity-60 cursor-not-allowed bg-slate-100" : ""
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Feedback Type Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">意見類別</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl p-2.5 outline-none focus:bg-white text-xs font-sans font-bold text-gray-750 transition-all cursor-pointer"
                    >
                      <option value="問題回報">⚠️ 問題回報</option>
                      <option value="建議事項">💡 建議事項</option>
                      <option value="一般留言">💬 一般留言</option>
                    </select>
                  </div>

                  {/* Feedback Facility Category Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">受影響區域</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl p-2.5 outline-none focus:bg-white text-xs font-sans font-bold text-gray-750 transition-all cursor-pointer"
                    >
                      <option value="有氧區">有氧運動區</option>
                      <option value="重訓區">重量訓練區</option>
                      <option value="自由重量區">自由重量區</option>
                      <option value="伸展區">墊上伸展區</option>
                      <option value="場館環境">整體場館環境 / 空調 / 淋浴間</option>
                      <option value="其它區域">其它問題 / 機構行政</option>
                    </select>
                  </div>
                </div>

                {/* Content Message Textarea */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">意見與詳細內容</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="例如：有氧運動區的一台十字飛輪（靠近窗戶）在踩動時有強烈金屬刮擦異音，且阻力沒作用。煩請值班同仁確認。"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl p-3 outline-none focus:bg-white transition-all text-xs font-sans"
                    style={{ minHeight: "120px" }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitLoading || (!isAnonymous && !username.trim()) || !content.trim()}
                  className={`w-full py-2.5 px-5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-colors shadow cursor-pointer ${
                    isSubmitLoading || (!isAnonymous && !username.trim()) || !content.trim()
                      ? "bg-gray-150 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/10 hover:-translate-y-0.5"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitLoading ? "正在送出案件中..." : "確認送出意見/報告"}</span>
                </button>
              </form>
            </div>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-normal font-sans">
            <span className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>中大體育室官方免責說明</span>
            </span>
            <span>本留言板僅限提供館內正常運動器材及非緊急軟硬體維護情況之意見交換。如遇竊盜、蓄意破壞行為或危急人身安全的緊急狀況，請立刻前往體育室輔助櫃檯或撥打校安中心電話，由官方校安同仁立刻指引介入。</span>
          </div>
        </div>

        {/* Right Side: Message Thread Display (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-4 gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-855 flex items-center gap-1.5">
                  <MessageCircle className="w-4.5 h-4.5 text-purple-600" />
                  <span>同學們在館反映事項時間線</span>
                </h3>
                <p className="text-[11px] text-gray-404 mt-0.5">顯示目前在線登記的最新意見反饋與工讀生答覆</p>
              </div>

              {/* Filtering Controls Row */}
              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 font-sans text-[10px]">
                <button
                  onClick={() => setSelectedTypeFilter("all")}
                  className={`px-2 py-1 rounded-md cursor-pointer transition-colors ${
                    selectedTypeFilter === "all" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setSelectedTypeFilter("問題回報")}
                  className={`px-2 py-1 rounded-md cursor-pointer transition-colors ${
                    selectedTypeFilter === "問題回報" ? "bg-red-50 text-red-650 shadow-sm font-bold border border-red-100" : "text-slate-500 hover:text-slate-805"
                  }`}
                >
                  問題回報
                </button>
                <button
                  onClick={() => setSelectedTypeFilter("建議事項")}
                  className={`px-2 py-1 rounded-md cursor-pointer transition-colors ${
                    selectedTypeFilter === "建議事項" ? "bg-amber-50 text-amber-600 shadow-sm font-bold border border-amber-100" : "text-slate-500 hover:text-slate-805"
                  }`}
                >
                  建議事項
                </button>
                <button
                  onClick={() => setSelectedTypeFilter("一般留言")}
                  className={`px-2 py-1 rounded-md cursor-pointer transition-colors ${
                    selectedTypeFilter === "一般留言" ? "bg-purple-50 text-purple-650 shadow-sm font-bold border border-purple-100" : "text-slate-500 hover:text-slate-805"
                  }`}
                >
                  一般留言
                </button>
              </div>
            </div>

            {/* Scrollable Container with limit to optimize rendering */}
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((f, index) => {
                  let borderCol = "border-l-purple-500 hover:bg-purple-50/5";
                  let typeTheme = "bg-purple-50 text-purple-600 border-purple-100";
                  if (f.type === "問題回報") {
                    borderCol = "border-l-red-500 hover:bg-red-50/5";
                    typeTheme = "bg-red-50 text-red-600 border-red-100";
                  } else if (f.type === "建議事項") {
                    borderCol = "border-l-amber-500 hover:bg-amber-50/5";
                    typeTheme = "bg-amber-50 text-amber-600 border-amber-100";
                  }

                  return (
                    <div 
                      key={f.id || index} 
                      className={`p-4 rounded-2xl bg-slate-50/60 border border-slate-150 border-l-4 ${borderCol} transition-colors`}
                    >
                      {/* Meta Tags Row */}
                      <div className="flex flex-wrap justify-between items-center text-[10px] gap-2 mb-2">
                        <div className="flex items-center gap-1.5 select-none text-[10px]">
                          <span className={`px-2 py-0.5 rounded-lg border font-bold ${typeTheme}`}>
                            {f.type}
                          </span>
                          <span className="bg-slate-200 max-w-[110px] text-slate-700 px-2 py-0.5 rounded-lg truncate border border-slate-300 flex items-center gap-1 font-semibold">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{f.category}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-350" />
                            <span className="font-semibold text-slate-600">{f.username}</span>
                          </span>
                          <span>|</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-350" />
                            <span>{f.timestamp}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content text block layout */}
                      <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line pl-1">
                        {f.content}
                      </p>

                      {/* Official Staff Reply nested layout */}
                      {f.reply ? (
                        <div className="mt-3.5 bg-white border border-slate-150 rounded-xl p-3 flex gap-2.5 shadow-sm animate-zoom-in">
                          <div className="bg-purple-650 text-white w-6 h-6 shrink-0 rounded-lg flex items-center justify-center font-bold text-[9px] font-mono select-none">
                            答
                          </div>
                          <div>
                            <p className="text-[10px] font-sans font-bold text-purple-705 flex items-center gap-1 shrink-0">
                              <span>值班工讀生回覆：</span>
                              <span className="text-gray-350 font-normal font-mono">落案答覆成功</span>
                            </p>
                            <p className="text-xs text-slate-650 leading-relaxed font-sans mt-0.5">
                              {f.reply}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 bg-slate-100/40 border border-dashed border-slate-200/80 rounded-xl p-2.5 text-center text-[10.5px] text-slate-400 font-sans italic flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-300 animate-spin-slow" />
                          <span>工讀生正在確認此案，並將於今日交接巡視前落案回覆。</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-gray-400 font-sans italic">
                  本時段尚無任何「{selectedTypeFilter === "all" ? "" : selectedTypeFilter}」登記留言。歡迎發表第一案！
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
