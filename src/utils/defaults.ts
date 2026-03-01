export interface Settings {
  hideHomeFeed: boolean;
  hideSidebar: boolean;
  hideComments: boolean;
  hideShorts: boolean;
  hideEndScreen: boolean;
  hideMiniPlayer: boolean;
  hideLiveChat: boolean;
  hideNotifications: boolean;
  hideTrending: boolean;
  hideAutoplay: boolean;
}

export interface ScheduleEntry {
  id: string;
  enabled: boolean;
  days: number[]; 
  startTime: string; 
  endTime: string; 
  settings: Settings;
}

export interface StorageData {
  settings: Settings;
  schedule: ScheduleEntry[];
  scheduleActive: boolean;
  isScheduleOverriding: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  hideHomeFeed: false,
  hideSidebar: false,
  hideComments: false,
  hideShorts: false,
  hideEndScreen: false,
  hideMiniPlayer: false,
  hideLiveChat: false,
  hideNotifications: false,
  hideTrending: false,
  hideAutoplay: false,
};

export const DEFAULT_STORAGE: StorageData = {
  settings: { ...DEFAULT_SETTINGS },
  schedule: [],
  scheduleActive: false,
  isScheduleOverriding: false,
};
