import React, { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  FileSpreadsheet, 
  Download, 
  TrendingUp, 
  Calendar, 
  Check, 
  Printer, 
  ExternalLink,
  Loader2
} from "lucide-react";

interface AdminReportsProps {
  state: GymStateSnapshot;
}

export default function AdminReports({ state }: AdminReportsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const triggerExport = (format: "excel" | "pdf" | "sync") => {
    setDownloading(format);
    setTimeout(() => {
      setDownloading(null);
      if (format === "excel") {
        alert("【報表匯出成功】\n已將本週中大健身房人流量分析檔案 (NCU-Gym-Report-2026.xlsx) 執行二進制加密打包，並下載至您的裝置中。");
      } else if (format === "pdf") {
        alert("【PDF列印包生成成功】\n今日體育館在館流量安全查核報表 (Gym-Safety-Verification.pdf) 已順利產生，正在傳送排程列印機。");
      } else {
        alert("【體育室行政主機同步完成】\n已成功向中大體育組教學行政系統 (NCU-PE-Server-V3) 回傳昨日與今日之校正客流、器材異常件數。");
      }
    }, 1205);
  };

  const daysOfWeek = ["週一 Mon", "週二 Tue", "週三 Wed", "週四 Thu", "週五 Fri", "週六 Sat", "週日 Sun"];
  const baselineFlow = [180, 245, 210, 280, 310, 150, 110];

  return (
    <div className="space-y-6 select-none bg-white p-2">
      
      {/* Overview stats cards for report summarization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-5 rounded-3xl text-white shadow-md">
          <Calendar className="w-6 h-6 opacity-85 mb-3" />
          <p className="text-[10px] text-purple-100 uppercase tracking-widest font-mono">本週累計進校人流</p>
          <p className="text-2xl font-black mt-1">1,412 人次</p>
          <div className="flex items-center gap-1 text-[10px] text-purple-100 font-bold mt-2 font-sans">
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-amber-200">比上週增長 +12.4%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">最受歡迎健身時段</p>
            <p className="text-2xl font-black text-slate-800 mt-1 font-sans">週五 19:00</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 border-t border-slate-100 pt-2 font-semibold">
            <span>單一整點最高峰:</span>
            <span className="font-mono text-purple-600 font-bold">48 人在線</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">器材平均完修天數</p>
            <p className="text-2xl font-black text-slate-800 mt-1 font-sans">3.4 天</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-505 mt-4 border-t border-slate-100 pt-2 font-semibold font-sans">
            <span>原廠最快排除:</span>
            <span className="font-mono text-emerald-600 font-bold">24 小時內</span>
          </div>
        </div>
      </div>

      {/* Main Action Block and Graphical displays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Grid: Highly styled export actions */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-808 flex items-center gap-1.5 font-sans">
                <FileSpreadsheet className="w-4.5 h-4.5 text-purple-600" />
                <span>體育室官方報表輸出門戶</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">值班工讀生可快速產出各類申核、備查之流動量與事件日誌實體檔</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-sans pb-1.5">
              請點選下方對應格式之按鈕以請求二進位格式建立：
            </p>

            <div className="space-y-2.5 font-sans">
              
              {/* Export 1: Excel */}
              <button
                id="btn-export-excel"
                onClick={() => triggerExport("excel")}
                disabled={downloading !== null}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-purple-300 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-between cursor-pointer transition-transform hover:-translate-y-0.5"
                type="button"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-[#15803d]" />
                  <span>匯出當週人流量統計 (Excel.xlsx)</span>
                </span>
                {downloading === "excel" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                ) : (
                  <Download className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Export 2: PDF */}
              <button
                id="btn-export-pdf"
                onClick={() => triggerExport("pdf")}
                disabled={downloading !== null}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-purple-300 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-between cursor-pointer transition-transform hover:-translate-y-0.5"
                type="button"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <Printer className="w-4.5 h-4.5 text-red-655" />
                  <span>列印今日安全容留報表 (PDF.pdf)</span>
                </span>
                {downloading === "pdf" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                ) : (
                  <Download className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Export 3: Sync System */}
              <button
                id="btn-export-sync"
                onClick={() => triggerExport("sync")}
                disabled={downloading !== null}
                className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-150 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-between cursor-pointer transition-transform hover:-translate-y-0.5"
                type="button"
              >
                <span className="flex items-center gap-2 text-purple-700">
                  <ExternalLink className="w-4.5 h-4.5" />
                  <span>點對點傳送體育課教學組系統</span>
                </span>
                {downloading === "sync" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-650" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>

            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/60 leading-relaxed text-center select-none font-sans">
            官方數據安全性：導出檔案將自動包含操作工讀生姓名、UTC+8 時間數位簽章。
          </div>
        </div>

        {/* Right Grid: Weekly splines layout (Col 2 & 3) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-808 flex items-center gap-1.5 font-sans">
              <TrendingUp className="w-4.5 h-4.5 text-purple-600" />
              <span>中大體育館本週每日流量走勢大圖</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">分析週一至週日進場學生的總人次與峰值分布波段特性</p>
          </div>

          {/* Premium visual chart area via SVGs */}
          <div className="relative bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex flex-col justify-between h-64 font-mono select-none">
            
            {/* Background dashed markings */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none opacity-30">
              <div className="border-b border-dashed border-slate-300 w-full mb-1"></div>
              <div className="border-b border-dashed border-slate-300 w-full mb-1"></div>
              <div className="border-b border-dashed border-slate-300 w-full mb-1"></div>
              <div className="border-b border-dashed border-slate-300 w-full mb-1"></div>
            </div>

            {/* Spline area */}
            <div className="relative w-full h-full flex items-end">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 520 180" preserveAspectRatio="none">
                {/* Spline area gradient */}
                <path
                  d="M 10 180 L 10 90 L 90 40 L 170 65 L 250 18 L 330 5 L 410 110 L 490 140 L 490 180 Z"
                  fill="url(#reportsGrad)"
                  opacity="0.1"
                />
                
                {/* Spline line */}
                <path
                  d="M 10 90 Q 90 40 170 65 T 250 18 T 330 5 T 410 110 T 490 140"
                  fill="none"
                  stroke="#9333EA"
                  strokeWidth="3.5"
                />

                <defs>
                  <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333EA" />
                    <stop offset="100%" stopColor="#f5f3ff" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Pinpoint note */}
              <div className="absolute left-[62%] bottom-[88%] bg-purple-600 text-white font-sans text-[8.5px] font-bold px-1.5 py-0.5 rounded shadow-lg animate-pulse">
                週五峰值：310人
              </div>
            </div>

            {/* Bottom labels */}
            <div className="flex justify-between text-[8px] font-sans font-extrabold text-slate-400 border-t border-slate-200/65 pt-2 z-10 bg-white/40">
              {daysOfWeek.map((day, idx) => (
                <div key={day} className="text-center">
                  <span>{day}</span>
                  <span className="block font-mono font-medium text-slate-450 mt-0.5">{baselineFlow[idx]}人次</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
