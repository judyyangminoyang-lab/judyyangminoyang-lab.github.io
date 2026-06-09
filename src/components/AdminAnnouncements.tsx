import React, { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Send, 
  Search 
} from "lucide-react";

interface AdminAnnouncementsProps {
  state: GymStateSnapshot;
  activeOperator: string;
  onAddAnnouncement: (content: string) => Promise<boolean>;
  onDeleteAnnouncement: (annId: string) => Promise<void>;
}

export default function AdminAnnouncements({
  state,
  onAddAnnouncement,
  onDeleteAnnouncement
}: AdminAnnouncementsProps) {
  // Form input states
  const [annTitle, setAnnTitle] = useState<string>("");
  const [annAudience, setAnnAudience] = useState<string>("全體校內外健身人員");
  const [annBody, setAnnBody] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) {
      alert("公告標題與內文均不能留空！");
      return;
    }

    setSubmitting(true);
    try {
      // Compose rich message that encodes title and target audience safely for vanilla string displays
      const formattedContent = `【${annTitle.trim()}】\n公告對象：${annAudience}\n\n${annBody.trim()}`;
      
      const ok = await onAddAnnouncement(formattedContent);
      if (ok) {
        setSuccessMsg("公告成功發佈，學生端前台看板也已即時推播！");
        setAnnTitle("");
        setAnnBody("");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = state.announcements.filter(ann => 
    ann.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none bg-white p-2">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Left Card: Create Announcement Form */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans">
              <Plus className="w-4.5 h-4.5 text-purple-600" />
              <span>發佈全新前台主要公告</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">公告將即時發佈於學生端，並自動載入至人流首頁上方</p>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl text-emerald-700 text-xs font-semibold animate-fade-in">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs select-text font-sans">
            <div>
              <label className="block text-slate-605 font-bold mb-1">公告對象 / 受眾標籤</label>
              <select
                value={annAudience}
                onChange={(e) => setAnnAudience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none cursor-pointer focus:bg-white text-xs font-bold"
              >
                <option value="全體校內外健身人員">全體校內外健身人員</option>
                <option value="中央大學在校生/教職員">中央大學在校生/教職員</option>
                <option value="僅限體育室內部工讀值班組員">僅限體育室內部工讀值班組員</option>
                <option value="外校一般參訪及付費會員">外校一般參訪及付費會員</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-605 font-bold mb-1">公告標題 *</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="例如：端午連假休館變更、消毒器材暫停"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white focus:border-purple-500 transition-all text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-605 font-bold mb-1">公告文字內容 *</label>
              <textarea
                required
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                placeholder="請詳細敘述活動時間、受影響區域，以及配合事宜..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-purple-500 transition-all text-xs leading-relaxed"
                style={{ minHeight: "140px" }}
              ></textarea>
            </div>

            <button
              id="btn-add-announcement-submit"
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-400 shadow-md shadow-purple-100 transition-transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "推播上架中..." : "上架並派送前台通知"}</span>
            </button>
          </form>
        </div>

        {/* Column 2 & 3: Bulletins Archieve */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
          
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans">
                <Bell className="w-4.5 h-4.5 text-purple-600" />
                <span>歷史公告與發布檔案庫</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">體育室目前對外掛載之全部資訊，可點選下架撤回</p>
            </div>
            {/* Simple search bar */}
            <div className="relative w-48 text-xs shrink-0 select-text font-sans">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="關鍵字搜尋..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl text-xs outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map(ann => {
                // Try extract title and target audience if they are structured formatted strings
                const matchTitle = ann.content.match(/^【(.*?)】\n公告對象：(.*?)\n\n/);
                let title = "常規前台新聞通知";
                let target = "全體健身客群";
                let displayBody = ann.content;

                if (matchTitle) {
                  title = matchTitle[1];
                  target = matchTitle[2];
                  displayBody = ann.content.replace(/^【.*?】\n公告對象：.*?\n\n/, "");
                }

                return (
                  <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-start gap-3 hover:bg-slate-105 transition-all">
                    
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-sans">
                        <span className="font-mono text-slate-400 font-bold">{ann.date}</span>
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-150 font-bold">
                          {target}
                        </span>
                        {ann.isNew && (
                          <span className="bg-red-50 text-red-655 px-1.5 py-0.2 rounded border border-red-100 text-[8.5px] font-bold">NEW</span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-808 text-sm leading-tight select-text font-sans">{title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line bg-white p-3 rounded-xl border border-slate-150 select-text">
                        {displayBody}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl border border-transparent hover:border-red-100 transition-colors cursor-pointer self-center shrink-0"
                      title="撤下此公告"
                      type="button"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                  </div>
                );
              })
            ) : (
              <div className="py-12 border border-dashed border-slate-200 rounded-3xl text-center italic text-slate-400 font-sans text-xs">
                ⚠️ 沒有找到符合搜尋條件的公告紀錄。
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
