import React, { useState } from "react";
import { GymStateSnapshot } from "../types";
import { 
  Wrench, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  MapPin
} from "lucide-react";

interface AdminEquipmentsProps {
  state: GymStateSnapshot;
  activeOperator: string;
  onAddEquipment: (id: string, name: string, location: string, status: string, description: string, estRepairDate: string) => Promise<boolean>;
  onUpdateEquipmentStatus: (equipId: string, status: string) => Promise<void>;
  onDeleteEquipment: (equipId: string) => Promise<void>;
}

export default function AdminEquipments({
  state,
  onAddEquipment,
  onUpdateEquipmentStatus,
  onDeleteEquipment
}: AdminEquipmentsProps) {
  // Form input states
  const [equipId, setEquipId] = useState<string>("");
  const [equipName, setEquipName] = useState<string>("");
  const [equipLoc, setEquipLoc] = useState<string>("重訓區");
  const [equipStatus, setEquipStatus] = useState<string>("故障中");
  const [equipDesc, setEquipDesc] = useState<string>("");
  const [equipEst, setEquipEst] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipId.trim() || !equipName.trim()) {
      alert("器材編號與名稱為必填項目！");
      return;
    }

    setSubmitting(true);
    try {
      const ok = await onAddEquipment(
        equipId.trim(),
        equipName.trim(),
        equipLoc,
        equipStatus,
        equipDesc.trim() || "無特別描述",
        equipEst.trim() || "--"
      );
      if (ok) {
        setSuccessBanner("器材報修申請登陸完成！");
        // Reset form
        setEquipId("");
        setEquipName("");
        setEquipDesc("");
        setEquipEst("");
        setTimeout(() => setSuccessBanner(""), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeFaults = state.equipments.filter(e => e.status !== "已修復");
  const resolvedFaults = state.equipments.filter(e => e.status === "已修復");

  return (
    <div className="space-y-6 select-none bg-white p-2">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Card 1: Equipment Reporting Form */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans">
              <Plus className="w-4.5 h-4.5 text-purple-600" />
              <span>中大健身房器材故障報修</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">手動填寫故障異常資料，隨即派單並追蹤修繕進度</p>
          </div>

          {successBanner && (
            <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl text-emerald-700 text-xs font-semibold animate-fade-in">
              {successBanner}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs select-text font-sans">
            <div>
              <label className="block text-slate-605 font-bold mb-1">器材編號 (ID) *</label>
              <input
                type="text"
                required
                value={equipId}
                onChange={(e) => setEquipId(e.target.value)}
                placeholder="例如：TR-004、DB-008"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono focus:bg-white focus:border-purple-500 transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-605 font-bold mb-1">器材名稱 *</label>
              <input
                type="text"
                required
                value={equipName}
                onChange={(e) => setEquipName(e.target.value)}
                placeholder="例如：史密斯訓練架、胸肌推舉器"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans focus:bg-white focus:border-purple-500 transition-all text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-605 font-bold mb-1">擺放位置</label>
                <select
                  value={equipLoc}
                  onChange={(e) => setEquipLoc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans cursor-pointer focus:bg-white text-xs"
                >
                  <option value="有氧區">有氧區</option>
                  <option value="重訓區">重訓區</option>
                  <option value="自由重量區">自由重量區</option>
                  <option value="伸展及拉伸區">伸展及拉伸區</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-605 font-bold mb-1">報修狀態</label>
                <select
                  value={equipStatus}
                  onChange={(e) => setEquipStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans cursor-pointer focus:bg-white text-xs"
                >
                  <option value="故障中">故障中 (暫停使用)</option>
                  <option value="維修中">維修中 (理排除中)</option>
                  <option value="已修復">已修復 (恢復正常)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-605 font-bold mb-1">故障詳細原因 *</label>
              <textarea
                required
                value={equipDesc}
                onChange={(e) => setEquipDesc(e.target.value)}
                placeholder="請詳述鋼索磨損、插梢卡死或面板無法亮起等具體原因..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans focus:bg-white focus:border-purple-500 transition-all text-xs"
                style={{ minHeight: "85px" }}
              ></textarea>
            </div>

            <div>
              <label className="block text-slate-605 font-bold mb-1">預計修復完畢日期</label>
              <input
                type="text"
                value={equipEst}
                onChange={(e) => setEquipEst(e.target.value)}
                placeholder="例如：2026/06/05 或 待原廠報價"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono focus:bg-white focus:border-purple-500 transition-all text-xs"
              />
            </div>

            <button
              id="btn-add-equipment-submit"
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-450 shadow-md shadow-purple-100"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? "提交申請中..." : "新增申報並派單公佈"}</span>
            </button>
          </form>
        </div>

        {/* Column 2 & 3: Interactive maintenance progress tracking */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
          
          <div>
            <h3 className="text-sm font-bold text-gray-855 flex items-center gap-1.5 font-sans">
              <Wrench className="w-4.5 h-4.5 text-purple-600" />
              <span>設備維修與異常排除進度追蹤清單</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">即時檢視各項報修狀態，工讀生與老師可隨時切換修繕階段流程</p>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {activeFaults.length > 0 ? (
              activeFaults.map(eq => {
                const isUnderRepair = eq.status === "維修中";
                
                return (
                  <div key={eq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-205 flex flex-col justify-between hover:bg-slate-105 transition-all gap-4">
                    
                    {/* Header and position */}
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-150 pb-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-805">[{eq.id}]</span>
                          <h4 className="font-bold text-sm text-slate-805">{eq.name}</h4>
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-350" />
                          <span>擺放位置：{eq.location}</span>
                        </div>
                      </div>

                      {/* Status indicator and changer */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                          eq.status === "故障中" ? "bg-red-50 text-red-655 border-red-150 animate-pulse" :
                          "bg-amber-50 text-amber-605 border-amber-150"
                        }`}>
                          {eq.status}
                        </span>
                        
                        <select
                          value={eq.status}
                          onChange={(e) => onUpdateEquipmentStatus(eq.id, e.target.value)}
                          className="bg-white border border-gray-200 text-[10px] py-1 px-2 rounded-xl font-bold text-gray-750 outline-none cursor-pointer font-sans"
                        >
                          <option value="故障中">故障中</option>
                          <option value="維修中">維修中</option>
                          <option value="已修復">已修復</option>
                        </select>
                      </div>
                    </div>

                    {/* Problem Description */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">損壞描述</span>
                      <p className="text-slate-650 leading-relaxed font-sans">{eq.description}</p>
                    </div>

                    {/* Process Timeline indicators */}
                    <div className="grid grid-cols-3 gap-1 pt-1.5 text-center font-sans">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-red-105 text-red-655 border border-red-200 flex items-center justify-center text-[10px] font-bold">1</div>
                        <span className="text-[9.5px] font-bold text-slate-500 mt-1">申報登記</span>
                        <span className="text-[8.5px] font-mono text-slate-400">{eq.reportTime || "本日"}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                          isUnderRepair ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-slate-200/50 text-slate-405 border-slate-205"
                        }`}>2</div>
                        <span className="text-[9.5px] font-bold text-slate-500 mt-1">原廠進場</span>
                        <span className="text-[8.5px] font-mono text-slate-405">{isUnderRepair ? "派工中" : "未開始"}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-slate-200/50 text-slate-450 border-slate-205 flex items-center justify-center text-[10px] font-bold">3</div>
                        <span className="text-[9.5px] font-bold text-slate-500 mt-1">測試結案</span>
                        <span className="text-[8.5px] font-mono text-slate-405">預計: {eq.estRepairDate}</span>
                      </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="flex justify-end pt-1 bg-slate-100/30 font-sans">
                      <button
                        onClick={() => onDeleteEquipment(eq.id)}
                        className="text-[10px] font-bold text-[#b91c1c] hover:bg-red-50 p-2 py-1.5 rounded-xl border border-red-100 cursor-pointer flex items-center gap-1.5 transition-colors"
                        type="button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>廢棄此單</span>
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-12 border border-dashed border-slate-200 rounded-3xl text-center font-sans italic text-slate-400 text-xs">
                🎉 太棒了！目前體育館內沒有任何故障的體能器材需追蹤。
              </div>
            )}

            {resolvedFaults.length > 0 && (
              <div className="pt-4 border-t border-slate-200/85">
                <h4 className="text-xs font-bold text-slate-550 mb-3 flex items-center gap-1.5 font-sans">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>最近已修復排除項目 ({resolvedFaults.length})</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resolvedFaults.map(eq => (
                    <div key={eq.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-50/50">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-705 font-sans">{eq.name}</p>
                        <p className="text-[9.5px] text-slate-405 font-mono">編號: {eq.id} | {eq.location}</p>
                      </div>
                      <button
                        onClick={() => onDeleteEquipment(eq.id)}
                        className="text-slate-400 hover:text-red-550 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer text-xs"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Row 3: Equipment faults maintenance table */}
      <section id="equipment-faults-table-section" className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm mt-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-gray-805 flex items-center gap-1.5 font-sans">
            <Wrench className="w-4.5 h-4.5 text-purple-600" />
            <span>設備異常維修排除管理台</span>
          </h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 text-xs text-slate-805">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-550 font-mono">
                <th className="py-2.5 px-4 font-bold">器材編號</th>
                <th className="py-2.5 px-4 font-bold">器材名稱</th>
                <th className="py-2.5 px-4 font-bold">擺放位置</th>
                <th className="py-2.5 px-4 font-bold">異常描述</th>
                <th className="py-2.5 px-4 font-bold">狀態標識</th>
                <th className="py-2.5 px-4 font-bold">修繕變更</th>
                <th className="py-2.5 px-4 font-bold">操作</th>
              </tr>
            </thead>
            <tbody>
              {state.equipments.map(eq => (
                <tr key={eq.id} className="border-b border-slate-100 hover:bg-slate-100/30 text-slate-755 transition-all">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-805">{eq.id}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-805 font-sans">{eq.name}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-500 font-sans">{eq.location}</td>
                  <td className="py-2.5 px-4 text-slate-404 font-sans max-w-xs truncate" title={eq.description}>{eq.description}</td>
                  <td className="py-2.5 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                      eq.status === "故障中" ? "bg-red-50 text-red-655 border-red-150" :
                      eq.status === "維修中" ? "bg-amber-50 text-amber-600 border-amber-150" :
                      "bg-green-50 text-green-655 border-green-150"
                    }`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans">
                    <select
                      value={eq.status}
                      onChange={(e) => onUpdateEquipmentStatus(eq.id, e.target.value)}
                      className="bg-white border border-gray-200 text-[10.5px] px-2 py-0.5 rounded-lg font-semibold text-gray-750 outline-none cursor-pointer"
                    >
                      <option value="故障中">故障中</option>
                      <option value="維修中">維修中</option>
                      <option value="已修復">已修復</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-4">
                    <button
                      onClick={() => onDeleteEquipment(eq.id)}
                      className="text-slate-450 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="刪除修繕檔案"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
