import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "firebase/firestore";

dotenv.config();

// Define __dirname equivalent for ES Modules / CommonJS builds
let activeFilename = "";
try {
  activeFilename = fileURLToPath(import.meta.url);
} catch (e) {
  activeFilename = typeof __filename !== "undefined" ? __filename : "";
}
const activeDirname = activeFilename ? path.dirname(activeFilename) : (typeof __dirname !== "undefined" ? __dirname : process.cwd());

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with safety fallback
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini AI client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.log("GEMINI_API_KEY is not set. Using rule-based fallback generator.");
}

// Global In-Memory Gym State
const gymState = {
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

// Initialize Firebase client in backend for Firestore persistence
let db: any = null;
let isFirebaseLoaded = false;
let firebaseSyncPromise: Promise<any> | null = null;
let lastLocalWriteTime = 0;

async function initFirebaseSync() {
  if (firebaseSyncPromise) return firebaseSyncPromise;
  
  firebaseSyncPromise = (async () => {
    try {
      let configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (!fs.existsSync(configPath)) {
        configPath = path.join(activeDirname, "firebase-applet-config.json");
      }
      if (!fs.existsSync(configPath)) {
        configPath = path.join(activeDirname, "../firebase-applet-config.json");
      }
      
      if (fs.existsSync(configPath)) {
        const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const firebaseApp = initializeApp(firebaseConfig);
        db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
        console.log("Firebase SDK is fully operational on backend.");

        const docRef = doc(db, "config", "gymState");
        
        // Initial load to make sure everything is populated on first reference
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dbData = docSnap.data();
          for (const key of Object.keys(gymState)) {
             delete (gymState as any)[key];
          }
          Object.assign(gymState, dbData);
          if (gymState.maxLimit !== 100) {
            gymState.maxLimit = 100;
          }
          console.log("Initial Firestore gymState configuration loaded successfully.");
        } else {
          await setDoc(docRef, gymState);
          console.log("Created missing Firestore gymState configuration with defaults.");
        }

        // Register real-time sync listener on backend
        onSnapshot(docRef, (snap) => {
          // Skip updating internal state from Firestore if we've just local-written to avoid race overwrites
          if (Date.now() - lastLocalWriteTime < 2500) {
            console.log("Backend onSnapshot skipped to prevent overwrite loop with recent local mutation.");
            return;
          }
          if (snap.exists()) {
            const dbData = snap.data() || {};
            // Safely keep references but match exact content
            for (const key of Object.keys(gymState)) {
              if (!(key in dbData)) {
                delete (gymState as any)[key];
              }
            }
            Object.assign(gymState, dbData);
            if (gymState.maxLimit !== 100) {
              gymState.maxLimit = 100;
            }
            console.log(`Backend gymState synchronized via Firestore snapshot: currentOccupancy = ${gymState.currentOccupancy}`);
          }
        }, (error) => {
          console.error("Backend real-time onSnapshot listener failed:", error);
        });

        isFirebaseLoaded = true;
      }
    } catch (error) {
      console.error("Failed to connect Firebase inside backend environment:", error);
    }
  })();
  
  return firebaseSyncPromise;
}

async function loadGymState() {
  await initFirebaseSync();
  return gymState;
}

async function saveGymState() {
  lastLocalWriteTime = Date.now();
  await initFirebaseSync();
  if (!db) return;
  try {
    const docRef = doc(db, "config", "gymState");
    await setDoc(docRef, gymState);
    console.log("Synced memory modifications straight back into Firestore reference config/gymState");
  } catch (error) {
    console.error("Failed to preserve state inside Firestore database:", error);
  }
}


// Update active prediction and advisory state based on actual data
function getAdvisorySummary(occupancy: number, weather: string) {
  const pct = (occupancy / gymState.maxLimit) * 100;
  if (pct >= 90) {
    return {
      status: "非常擁擠",
      banner: "即將客滿！目前人數已達 " + pct.toFixed(0) + "% ，建議暫緩前往健身房以保持流暢體感。",
      tip: "目前健身房極度擁擠。根據人流預測，擁擠將持續約1小時，強烈建議您改為 21:00 以後或隔天早上再來運動，以享有更自在寬敞的運動空間！",
      color: "red"
    };
  } else if (pct >= 75) {
    return {
      status: "擁擠",
      banner: "人潮偏多！館內已達 " + pct.toFixed(0) + "% 使用率，部分熱門器材需要排隊等待。",
      tip: "目前人數偏多，建議避開 18:00 - 21:00 的高度尖峰。可考慮選擇前往「伸展區」或「自由重量區」，這兩個空間目前利用率相對較低。",
      color: "orange"
    };
  } else if (pct >= 40) {
    return {
      status: "普通",
      banner: "人數適中。目前使用率約為 " + pct.toFixed(0) + "%，各區域尚有充裕器材可供運作。",
      tip: "目前環境適中！有氧區的踏步機及飛輪仍有部分空折。重訓區人數雖然正在漸增，但您依然可以流暢地進行循環训练。",
      color: "blue"
    };
  } else {
    return {
      status: "清閒",
      banner: "空間空曠！使用率僅 " + pct.toFixed(0) + "%，非常適合現在立刻前往享受完美的運動時光！",
      tip: "目前是絕佳的冷門時段，館內人數非常少，所有熱門器材皆無需等待。趕快帶上裝備出發吧！",
      color: "green"
    };
  }
}

// Setup background hourly log increment routine for realistic live feel
function updateRefreshTime() {
  gymState.lastUpdateTime = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

// Endpoints
// Automate real-time Firestore database synchronization via middleware
app.use("/api/state", async (req: Request, res: Response, next) => {
  await loadGymState();
  
  if (req.method !== "GET") {
    const originalJson = res.json;
    res.json = function (body) {
      saveGymState().then(() => {
        originalJson.call(this, body);
      }).catch(err => {
        console.error("Auto-save failed inside middleware wrapper:", err);
        originalJson.call(this, body);
      });
      return res;
    };
  }
  next();
});

app.get("/api/state", (req: Request, res: Response) => {
  res.json(gymState);
});


// Update occupancy
app.post("/api/state/occupancy", (req: Request, res: Response) => {
  const { value, method, user } = req.body;
  const oldVal = gymState.currentOccupancy;
  let newVal = oldVal;

  if (method === "inc") {
    newVal = Math.min(gymState.maxLimit, oldVal + 1);
  } else if (method === "dec") {
    newVal = Math.max(0, oldVal - 1);
  } else if (typeof value === "number") {
    newVal = Math.max(0, Math.min(gymState.maxLimit, value));
  }

  gymState.currentOccupancy = newVal;
  updateRefreshTime();

  // Also update regions slightly to match overall occupancy status
  const cardPercent = newVal >= 45 ? 95 : newVal >= 40 ? 92 : newVal >= 30 ? 75 : newVal >= 15 ? 45 : 15;
  const weightPercent = newVal >= 45 ? 90 : newVal >= 40 ? 68 : newVal >= 30 ? 55 : newVal >= 15 ? 35 : 10;
  
  gymState.regions[0].current = Math.round((cardPercent / 100) * gymState.regions[0].limit);
  gymState.regions[0].usageRate = cardPercent;
  gymState.regions[0].status = cardPercent >= 80 ? "擁擠" : cardPercent >= 40 ? "普通" : "空間";

  gymState.regions[1].current = Math.round((weightPercent / 100) * gymState.regions[1].limit);
  gymState.regions[1].usageRate = weightPercent;
  gymState.regions[1].status = weightPercent >= 80 ? "擁擠" : weightPercent >= 40 ? "普通" : "空間";

  // Record audit log
  const logId = String(gymState.logs.length + 1);
  const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const newLog = {
    id: logId,
    time: timeStr,
    user: user || "系統管理員",
    action: "調整即時人數",
    details: `將即時人數變更為 ${newVal} 人`,
    before: String(oldVal),
    after: String(newVal)
  };
  gymState.logs.unshift(newLog);

  // Sync hourly history (current hour update)
  const currentHour = new Date().getHours();
  gymState.hourlyHistory[currentHour] = newVal;

  res.json({ success: true, state: gymState });
});

// Update specific region status
app.post("/api/state/regions", (req: Request, res: Response) => {
  const { regionId, status, user } = req.body;
  const region = gymState.regions.find(r => r.id === regionId);
  if (!region) {
    return res.status(404).json({ error: "Region not found" });
  }

  const oldStatus = region.status;
  region.status = status;
  
  // Set approximate usage percentage based on status
  if (status === "擁擠") {
    region.usageRate = 90;
    region.current = Math.round(region.limit * 0.9);
  } else if (status === "普通") {
    region.usageRate = 60;
    region.current = Math.round(region.limit * 0.6);
  } else if (status === "空間") {
    region.usageRate = 30;
    region.current = Math.round(region.limit * 0.3);
  } else { // 空閒
    region.usageRate = 15;
    region.current = Math.round(region.limit * 0.15);
  }

  updateRefreshTime();

  // Audit log
  const logId = String(gymState.logs.length + 1);
  const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  gymState.logs.unshift({
    id: logId,
    time: timeStr,
    user: user || "系統管理員",
    action: "修改區域狀態",
    details: `${region.name} 狀態變更為：${status}`,
    before: `${region.name}：${oldStatus}`,
    after: `${region.name}：${status}`
  });

  res.json({ success: true, state: gymState });
});

// Feedback Endpoints
app.post("/api/state/feedback/add", (req: Request, res: Response) => {
  const { username, type, category, content } = req.body;
  if (!username || !content) {
    return res.status(400).json({ error: "Username and content are required" });
  }

  const id = String(gymState.feedbacks.length + 1);
  const timestamp = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }) + " " +
                    new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });

  const newFeedback = {
    id,
    username,
    type: type || "一般留言",
    category: category || "一般熱區",
    content,
    timestamp,
    reply: ""
  };

  gymState.feedbacks.unshift(newFeedback);
  updateRefreshTime();

  // Audit log
  const logId = String(gymState.logs.length + 1);
  const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  gymState.logs.unshift({
    id: logId,
    time: timeStr,
    user: "系統 (使用者意見)",
    action: "新增留言與回報",
    details: `同學 [${username}] 回報: ${content.substring(0, 15)}...`,
    before: "--",
    after: `${username} 的留言`
  });

  res.json({ success: true, state: gymState });
});

app.post("/api/state/feedback/reply", (req: Request, res: Response) => {
  const { id, reply, user } = req.body;
  const feedback = gymState.feedbacks.find(f => f.id === id);
  if (!feedback) {
    return res.status(404).json({ error: "Feedback not found" });
  }

  feedback.reply = reply;
  updateRefreshTime();

  // Audit log
  const logId = String(gymState.logs.length + 1);
  const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  gymState.logs.unshift({
    id: logId,
    time: timeStr,
    user: user || "系統管理員",
    action: "回覆意見留言",
    details: `回覆同學 [${feedback.username}] 的留言：${reply.substring(0, 15)}...`,
    before: "--",
    after: reply.substring(0, 15)
  });

  res.json({ success: true, state: gymState });
});

app.post("/api/state/feedback/delete", (req: Request, res: Response) => {
  const { id, user } = req.body;
  const index = gymState.feedbacks.findIndex(f => f.id === id);
  if (index !== -1) {
    const deleted = gymState.feedbacks[index];
    gymState.feedbacks.splice(index, 1);
    updateRefreshTime();

    // Audit log
    const logId = String(gymState.logs.length + 1);
    const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    gymState.logs.unshift({
      id: logId,
      time: timeStr,
      user: user || "系統管理員",
      action: "刪除意見留言",
      details: `下架了同學 [${deleted.username}] 的留言`,
      before: deleted.content.substring(0, 15),
      after: "已下架"
    });
  }

  res.json({ success: true, state: gymState });
});

// Create announcement
app.post("/api/state/announcements/add", (req: Request, res: Response) => {
  const { content, user } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  const id = String(gymState.announcements.length + 1);
  const dateStr = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
  const originalDate = dateStr.replace(/\-/g, "/"); // normalize separator

  gymState.announcements.unshift({
    id,
    date: originalDate,
    content,
    isNew: true
  });
  updateRefreshTime();

  // Audit log
  const logId = String(gymState.logs.length + 1);
  const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  gymState.logs.unshift({
    id: logId,
    time: timeStr,
    user: user || "系統管理員",
    action: "新增公告資訊",
    details: `發佈公告: ${content.substring(0, 15)}...`,
    before: "--",
    after: content.substring(0, 20)
  });

  res.json({ success: true, state: gymState });
});

// Delete announcement
app.post("/api/state/announcements/delete", (req: Request, res: Response) => {
  const { id, user } = req.body;
  const index = gymState.announcements.findIndex(a => a.id === id);
  if (index !== -1) {
    const deleted = gymState.announcements[index];
    gymState.announcements.splice(index, 1);
    updateRefreshTime();

    // Audit log
    const logId = String(gymState.logs.length + 1);
    const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    gymState.logs.unshift({
      id: logId,
      time: timeStr,
      user: user || "系統管理員",
      action: "刪除公告資訊",
      details: `下架公告: ${deleted.content.substring(0, 15)}...`,
      before: deleted.content.substring(0, 15),
      after: "已下架"
    });
  }

  res.json({ success: true, state: gymState });
});

// Add Equipment fault
app.post("/api/state/equipment/add", (req: Request, res: Response) => {
  const { id, name, location, status, description, estRepairDate, user } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: "ID and Name are required" });
  }

  const reportTime = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }) + " " + 
                     new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });

  const newItem = {
    id,
    name,
    location,
    status: status || "故障中",
    description: description || "無特別描述",
    reportTime,
    estRepairDate: estRepairDate || "--"
  };

  gymState.equipments.unshift(newItem);
  updateRefreshTime();

  // Audit log
  const logId = String(gymState.logs.length + 1);
  const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  gymState.logs.unshift({
    id: logId,
    time: timeStr,
    user: user || "系統管理員",
    action: "新增故障器材",
    details: `新增器材：${name} (${id})`,
    before: "--",
    after: `${name}：${status}`
  });

  res.json({ success: true, state: gymState });
});

// Update Equipment status
app.post("/api/state/equipment/update", (req: Request, res: Response) => {
  const { id, status, name, location, description, estRepairDate, user } = req.body;
  const item = gymState.equipments.find(e => e.id === id);
  if (!item) {
    return res.status(404).json({ error: "Equipment not found" });
  }

  const oldStatus = item.status;
  if (status) item.status = status;
  if (name) item.name = name;
  if (location) item.location = location;
  if (description) item.description = description;
  if (estRepairDate) item.estRepairDate = estRepairDate;

  updateRefreshTime();

  // Audit log
  const logId = String(gymState.logs.length + 1);
  const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  gymState.logs.unshift({
    id: logId,
    time: timeStr,
    user: user || "系統管理員",
    action: "更新器材狀態",
    details: `更新 ${item.name} 狀態為：${status}`,
    before: `${item.name}：${oldStatus}`,
    after: `${item.name}：${status}`
  });

  res.json({ success: true, state: gymState });
});

// Delete equipment record
app.post("/api/state/equipment/delete", (req: Request, res: Response) => {
  const { id, user } = req.body;
  const index = gymState.equipments.findIndex(e => e.id === id);
  if (index !== -1) {
    const deleted = gymState.equipments[index];
    gymState.equipments.splice(index, 1);
    updateRefreshTime();

    // Audit log
    const logId = String(gymState.logs.length + 1);
    const timeStr = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    gymState.logs.unshift({
      id: logId,
      time: timeStr,
      user: user || "系統管理員",
      action: "刪除故障紀錄",
      details: `下架/移除器材故障：${deleted.name} (${id})`,
      before: `${deleted.name}：${deleted.status}`,
      after: "已移除"
    });
  }

  res.json({ success: true, state: gymState });
});

// Staff Management Endpoints (Proxying to Firestore for unauthenticated Preview environments)
app.get("/api/state/staff", async (req: Request, res: Response) => {
  if (!db) {
    return res.json([]);
  }
  try {
    const list: any[] = [];
    const snap = await getDocs(collection(db, "staff_members"));
    snap.forEach((docSnap) => {
      list.push({ email: docSnap.id, ...docSnap.data() });
    });
    res.json(list);
  } catch (error) {
    console.error("Backend failed to get staff collection:", error);
    res.status(500).json({ error: "Failed to load staff list" });
  }
});

app.post("/api/state/staff/add", async (req: Request, res: Response) => {
  const { email, role, assignedBy } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!db) {
    return res.json({ success: true });
  }
  try {
    await setDoc(doc(db, "staff_members", email.trim().toLowerCase()), {
      role: role || "staff",
      assignedAt: new Date().toISOString(),
      assignedBy: assignedBy || "Super Admin"
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Backend failed to add staff:", error);
    res.status(500).json({ error: "Failed to add staff" });
  }
});

app.post("/api/state/staff/delete", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!db) {
    return res.json({ success: true });
  }
  try {
    await deleteDoc(doc(db, "staff_members", email.trim().toLowerCase()));
    res.json({ success: true });
  } catch (error) {
    console.error("Backend failed to delete staff:", error);
    res.status(500).json({ error: "Failed to delete staff" });
  }
});

// AI Predictions & Advice endpoint
app.post("/api/ai/predict", async (req: Request, res: Response) => {
  const { query, customPrefs } = req.body;
  await loadGymState();
  const currentCount = gymState.currentOccupancy;
  const usagePercentage = ((currentCount / gymState.maxLimit) * 100).toFixed(0);

  const defaultAdvisory = getAdvisorySummary(currentCount, "晴天");
  
  const regionsSummary = gymState.regions.map(r => `${r.name}: ${r.status} (${r.usageRate}%)`).join(", ");
  const listFaulty = gymState.equipments.filter(e => e.status !== "已修復").map(e => `${e.name} (${e.status})`).join(", ");

  let contentResponse: any = {};

  if (ai) {
    try {
      console.log("Constructing prompt for Gemini model...");
      const systemInstruction = 
        `你是一位專業的中大健身房 (NCU Gym) 的 AI 智慧運動顧問。
        你的任務是根據健身房當前的即時狀態、人流歷史跟區域擁擠度，為使用者生成精緻、實用且富有人性關懷的「智慧建議 (Smart Tips)」以及「未來人數預測分析」。
        請直接回傳 JSON 格式，不要包含額外的 Markdown (\`\`\`json) 標籤。格式如下：
        {
          "smartTip": "一句簡短而親切的話，提醒當前是否適合運動（20-30字）",
          "detailedAnalysis": "深入的人流分析與具體器材重整建議（100-150字）",
          "predictions": {
            "in30Mins": "預估30分鐘後的人數 (如：45人) 及趨勢原因敘述",
            "in1Hr": "預估1小時後的人數 (如：48人、使用率達 96%) 及趨勢原因敘述",
            "in2Hrs": "預估2小時後的人數 (如：42人、使用率降至 84%) 及趨勢原因敘述"
          },
          "recommendations": [
            "推薦1: e.g. 目前伸展區與自由重量區空間充足，適宜進行核心鍛鍊。",
            "推薦2: e.g. 建議避開 跑步機 等較擁擠的有氧設備，改移往重訓區胸推機等器材。"
          ],
          "personalAdvice": "若有個人化偏好 (如：偏好18:00運動)，提供客製化的到場貼心建議"
        }`;

      const userPrompt = 
        `當前健身房環境狀況如下：
        - 即時人數：${currentCount} 人 / 容納上限：${gymState.maxLimit} 人 (使用率：${usagePercentage}%)
        - 天氣狀態：28°C 晴天
        - 區域擁擠分佈：${regionsSummary}
        - 故障中的器材：${listFaulty || "目前尚無故障器材"}
        - 使用者偏好描述：${customPrefs || "無特別偏好，想要尋求最佳運動時段"}
        
        請根據以上數據，為我分析並生成最新一期的 AI 智慧建議。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      if (response && response.text) {
        const cleanedText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
        contentResponse = JSON.parse(cleanedText);
        console.log("AI prediction generated successfully from Gemini.");
      }
    } catch (err) {
      console.error("Gemini invocation failed, falling back to dynamic template rules:", err);
    }
  }

  // Fallback if AI is null or response failed
  if (!contentResponse.smartTip) {
    const isHigh = currentCount >= 40;
    const isMed = currentCount >= 25 && currentCount < 40;
    
    contentResponse = {
      smartTip: isHigh 
        ? "目前人數偏多，建議選擇重訓或核心伸展，有氧區設備多在排隊中。" 
        : isMed 
        ? "場館人數適中，伸展與自由重量區使用體感良好，正是運動好時機！" 
        : "場內極為空折！所有運動器材均無需排隊，歡迎立刻前往鍛鍊！",
      detailedAnalysis: isHigh 
        ? `目前健身房佔用率達 ${usagePercentage}%。根據歷史尖峰模型，此時段正值放學及下班熱潮。有氧區 (${gymState.regions[0].usageRate}%) 極度擁擠，部分設備如跑步機可能需要較長的輪候時間。建議前往伸展區進行腹肌與墊上運動。`
        : `目前健身房使用率約 ${usagePercentage}%，各區擁擠程度處於普通至空間。重訓區尚有多台機械器材空置，飛輪車也維持良好的循環排隊速度，完全可以享受無阻隔的流暢訓練歷程。`,
      predictions: {
        in30Mins: `${Math.min(50, Math.round(currentCount * 1.1))} 人 (預期放學人潮緩步爬升，熱門區域將更加溫熱)`,
        in1Hr: `${Math.min(50, Math.round(currentCount * 1.15))} 人 (尖峰頂點，建議避開密集有氧運動區)`,
        in2Hrs: `${Math.max(5, Math.round(currentCount * 0.8))} 人 (人潮開始散去，場內空間體感將重回舒適適中)`
      },
      recommendations: [
        isHigh ? "避開有氧設備，多加利用 自由重量區 啞鈴及槓鈴進行力量訓練。" : "目前 伸展區 空間格外寬敞，適宜安排進行拉伸、瑜珈等深層核心修復。",
        listFaulty.includes("跑步機") ? "由於 跑步機3號 仍在維修中，可以選擇划船機或太空漫步機作為替代有氧設施項目。" : "重訓區的多功能深蹲架尚有空折，建議抓緊熱度，進行全身複合關節鍛鍊。"
      ],
      personalAdvice: customPrefs 
        ? `針對您的偏好 (${customPrefs})：建議避開當下的擁擠趨勢，提早 30 分鐘或選擇在 21:00 後進場，才能免去排隊等候，更專注於高效率健身。`
        : "若您喜歡清靜的運動環境，中大健身房最佳的隱藏高體感時段為上午 08:00 - 11:00 以及午餐過後 13:00 - 15:00！"
    };
  }

  res.json(contentResponse);
});

// Vite middleware and fallback HTML single page routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NCU Gym Monitor] Server starts listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
