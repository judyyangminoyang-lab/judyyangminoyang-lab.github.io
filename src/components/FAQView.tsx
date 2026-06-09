import { HelpCircle, ShieldAlert } from "lucide-react";

export default function FAQView() {
  const faqs = [
    {
      q: "中大健身房的容留上限是多少？",
      a: "配合消防、空氣對流及器材妥善比率，中大健身房實施總人數控管，上限恆定為 50 人。當在館人數大於或等於 45 人（使用率達 90%）時，本系統將顯示「即將客滿警告」，現場工讀生將啟動「一進一出」流量管制，以保障安全與運動體感。"
    },
    {
      q: "我該如何避開熱門的排隊塞塞尖峰？",
      a: "人流趨勢大數據顯示，每日最擁擠的時段為放學與下課後的「18:00 - 21:00」。如果您不希望在有氧踏步、深蹲床或臥推高頻處輪候排隊，極度推薦您改在「上午 08:00 - 11:00」的最佳冷門時光；亦可經常關注我們「熱區地圖」的顏色分佈作戰術調整！"
    },
    {
      q: "如果發現器材有鋼索磨損、橡膠脫落或異常異音，該如何舉報？",
      a: "您可以直接前往入口諮詢處，向值勤的體育室工讀生口頭彙報；工讀生將當場登記。隨後本系統「故障器材」板塊將立即發佈並登記維修進度（如「維修中」、「預計修復：05/24」）供大夥防滑。"
    },
    {
      q: "本系統的即時人數是每多久刷新一次的？",
      a: "入口設有電子人流紅外線感應閘機。每當有人刷卡刷入或踏出，系統便會同步微調。工讀生每隔整半小時也會進行现场複檢人數，調校更精準的在讀數據保持誤差率小於 5%。"
    },
    {
      q: "智慧建議 (Smart Tip) 電報是如何分析出来的？",
      a: "本功能由 Gemini AI 模組驅動，即時解析當前的飽和容量比例、子區擁塞程度以及您自訂的鍛鍊愛好。我們會根據多維條件快速算出排隊指數，為您做人性化的前瞻指引，助您輕鬆制定最佳行程。"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white select-none">
      
      {/* Header */}
      <header className="mb-6 border-b border-gray-200 pb-5 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold font-sans text-gray-950 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-purple-600" />
          <span>常見問題解答 FAQ</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          關於中大體育館容量管制、尖峰錯落、故障登陸機制等綜合流程常規須知
        </p>
      </header>

      {/* Accordions list */}
      <section className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-purple-50 p-2 rounded-xl text-purple-600 shrink-0 font-bold text-xs mt-0.5">
                Q
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-relaxed font-sans">
                  {faq.q}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500 font-sans mt-2.5 bg-gray-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Support Callout banner */}
        <div className="bg-purple-50/40 p-4.5 rounded-2xl border border-purple-100 flex items-center gap-3.5 max-w-4xl mx-auto mt-8 font-sans">
          <ShieldAlert className="w-5.5 h-5.5 text-purple-600 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-purple-955">體育室值班窗口客服聯絡資訊</p>
            <p className="text-purple-800 mt-0.5 leading-normal">如遇任何突發水管堵截、跳電或急救設備調用異常，請速往值班室找教練教員，或撥校內分機 57122 尋求協助。</p>
          </div>
        </div>
      </section>

    </div>
  );
}
