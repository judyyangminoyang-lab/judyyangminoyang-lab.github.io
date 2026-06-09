export interface WeatherInfo {
  temp: number;
  condition: string;
}

export interface GymRegion {
  id: string;
  name: string;
  status: string; // 擁擠 | 普通 | 空間 | 非常空閒
  usageRate: number;
  limit: number;
  current: number;
}

export interface Announcement {
  id: string;
  date: string;
  content: string;
  isNew: boolean;
}

export interface EquipmentRecord {
  id: string;
  name: string;
  location: string;
  status: string; // 故障中 | 維修中 | 已修復
  description: string;
  reportTime: string;
  estRepairDate: string;
}

export interface AuditLog {
  id: string;
  time: string;
  user: string;
  action: string;
  details: string;
  before: string;
  after: string;
}

export interface Feedback {
  id: string;
  username: string;
  type: string; // 問題回報 | 建議事項 | 一般留言
  category: string;
  content: string;
  timestamp: string;
  reply: string;
}

export interface GymStateSnapshot {
  currentOccupancy: number;
  maxLimit: number;
  weather: WeatherInfo;
  lastUpdateTime: string;
  regions: GymRegion[];
  announcements: Announcement[];
  equipments: EquipmentRecord[];
  logs: AuditLog[];
  hourlyHistory: number[];
  yesterdayHourlyHistory: number[];
  feedbacks: Feedback[];
}

export interface AIPredictionData {
  smartTip: string;
  detailedAnalysis: string;
  predictions: {
    in30Mins: string;
    in1Hr: string;
    in2Hrs: string;
  };
  recommendations: string[];
  personalAdvice: string;
}
