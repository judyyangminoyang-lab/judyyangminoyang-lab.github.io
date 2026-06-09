import { GymStateSnapshot } from "../types";
import { Megaphone, Calendar, ChevronRight } from "lucide-react";

interface AnnouncementsViewProps {
  state: GymStateSnapshot;
}

export default function AnnouncementsView({ state }: AnnouncementsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white select-none">
      
      {/* Header */}
      <header className="mb-6 border-b border-gray-200 pb-5 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold font-sans text-gray-950 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-purple-600" />
          <span>最新公告 & 新聞</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          掌握中大健身房近期之臨時閉館時段、維修消毒通知與收費變動政策
        </p>
      </header>

      {/* Timeline layouts */}
      <section className="max-w-4xl mx-auto space-y-6">
        {state.announcements.map((ann, idx) => (
          <div 
            key={ann.id} 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:scale-[1.005] transition-transform relative overflow-hidden group"
          >
            {ann.isNew && (
              <span className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-black tracking-wide px-3 py-1 rounded-bl-xl uppercase animate-pulse font-sans">
                NEW
              </span>
            )}

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-400 mb-3">
              <Calendar className="w-4 h-4 text-gray-300" />
              <span>{ann.date}</span>
            </div>

            <h3 className="text-sm font-bold text-gray-900 leading-relaxed font-sans mb-2">
              {idx === 0 ? "⚠️ 臨時閉館與例行清潔通知" : "📢 健身房例行管理與收費提示"}
            </h3>

            <p className="text-xs leading-relaxed text-gray-600 font-sans whitespace-pre-line bg-gray-50 p-3.5 rounded-xl border border-slate-100">
              {ann.content}
            </p>

            <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-gray-400 pt-3 border-t border-gray-100/50">
              <span>體育室管理組 發佈發稿</span>
              <span className="flex items-center gap-1 hover:text-purple-600 transition-colors cursor-pointer">
                <span>詳細原文</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}

        {state.announcements.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center text-gray-400 font-sans italic">
            目前沒有發佈中之公告，請定時關注。
          </div>
        )}
      </section>

    </div>
  );
}
