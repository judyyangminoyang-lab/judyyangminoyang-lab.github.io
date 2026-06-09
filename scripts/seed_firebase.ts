import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

async function seed() {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (!fs.existsSync(configPath)) {
    console.error(`Firebase configuration file not found at: ${configPath}`);
    process.exit(1);
  }

  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

  const defaultGymState = {
    currentOccupancy: 38,
    maxLimit: 100,
    weather: { temp: 28, condition: "晴天" },
    lastUpdateTime: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
    regions: [
      { id: "cardio", name: "有氧區", status: "普通", usageRate: 58, limit: 30, current: 17 },
      { id: "weight", name: "重訓區", status: "普通", usageRate: 65, limit: 40, current: 26 },
      { id: "freeWeight", name: "自由重量區", status: "空間", usageRate: 35, limit: 20, current: 7 },
      { id: "stretch", name: "伸展區", status: "空間", usageRate: 20, limit: 10, current: 2 }
    ],
    announcements: [
      { id: "1", date: "2026/05/20", content: "05/20 (一) 晚上 10:00 - 12:00 將進行館內清潔維護，部分區域暫停開放，造成不便敬請見諒。", isNew: true },
      { id: "2", date: "2026/05/18", content: "中大體育館暑期開放時間微調，詳情請參閱體育室最新公告。", isNew: false }
    ],
    equipments: [
      { id: "TR-003", name: "跑步機 3 號", location: "有氧區", status: "維修中", description: "跑步機啟動後會異常停止，待更換皮帶。", reportTime: "2026/05/20 10:23", estRepairDate: "2026/05/24" },
      { id: "DB-015", name: "啞鈴 15KG", location: "重訓區", status: "維修中", description: "啞鈴橡膠把脫落，送回原廠修理。", reportTime: "2026/05/19 16:45", estRepairDate: "2026/05/21" },
      { id: "SQ-002", name: "深蹲架", location: "重訓區", status: "故障中", description: "安全扣無法固定，已封鎖暫停使用。", reportTime: "2026/05/20 09:12", estRepairDate: "--" },
      { id: "BIKE-007", name: "飛輪單車 7 號", location: "有氧區", status: "維修中", description: "踏板異音。", reportTime: "2026/05/18 14:30", estRepairDate: "2026/05/20" },
      { id: "PL-001", name: "胸推機", location: "重訓區", status: "已修復", description: "座椅調整卡住，已調整鎖緊完畢。", reportTime: "2026/05/10 11:05", estRepairDate: "2026/05/12" }
    ],
    logs: [
      { id: "1", time: "14:35:28", user: "系統管理員", action: "調整即時人數", details: "手動將即時人數變更為 38 人", before: "42", after: "38" }
    ],
    hourlyHistory: [10, 12, 11, 8, 15, 22, 28, 30, 25, 29, 32, 40, 42, 38, 35, 34, 38, 45, 48, 42, 30, 20, 15, 8],
    yesterdayHourlyHistory: [8, 10, 9, 7, 12, 18, 24, 28, 23, 26, 30, 38, 39, 35, 32, 33, 36, 42, 44, 39, 28, 18, 12, 6],
    feedbacks: [
      { id: "1", username: "大一張同學", type: "問題回報", category: "有氧區", content: "有氧區的 2 號滑步機阻力調整鈕好像壞掉了，調整了都沒有反應，請工讀生幫忙確認。", timestamp: "2026/05/21 16:42", reply: "感謝回報！我們已經在機台上貼上「故障待修」告示，並通報體育室廠商，將在下週一進場維修。" },
      { id: "2", username: "重訓狂人", type: "建議事項", category: "重訓區", content: "希望重訓區可以多添購一組 22.5KG 與 25KG 的啞鈴，晚上熱門段經常要排隊很久。", timestamp: "2026/05/20 19:30", reply: "好的，會將您的建議提報給體育室管理老師，評估年度設備添購預算。謝謝您的建議！" },
      { id: "3", username: "健美小草", type: "一般留言", category: "伸展區", content: "今天下午去伸展區發現地板有水漬，可能是有人帶水瓶潑出來了，再麻煩巡視的工讀生協助拖乾淨～", timestamp: "2026/05/20 15:15", reply: "收到！值班工讀生已立即清潔完成。也呼籲同學攜帶有蓋水瓶，避免傾倒漏水。" }
    ]
  };

  try {
    const docRef = doc(db, "config", "gymState");
    await setDoc(docRef, defaultGymState);
    console.log("Successfully seeded gymState document into Firebase Firestore under config/gymState!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed database state:", err);
    process.exit(1);
  }
}

seed();
