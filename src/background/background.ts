

const DEFAULT_SETTINGS = {
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

type Settings = typeof DEFAULT_SETTINGS;

interface ScheduleEntry {
  id: string;
  enabled: boolean;
  days: number[];
  startTime: string;
  endTime: string;
  settings: Settings;
}

interface ScheduleStorageData {
  settings: Settings;
  schedule: ScheduleEntry[];
  scheduleActive: boolean;
  isScheduleOverriding: boolean;
  manualSettings: Settings | null;
}

const ALARM_NAME = 'ytfocus-schedule-check';

chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
  if (alarm.name === ALARM_NAME) {
    checkSchedule();
  }
});

chrome.runtime.onStartup.addListener(() => {
  checkSchedule();
});

chrome.runtime.onInstalled.addListener(() => {
  checkSchedule();
});

async function checkSchedule(): Promise<void> {
  const data = (await chrome.storage.sync.get([
    'settings',
    'schedule',
    'scheduleActive',
    'isScheduleOverriding',
    'manualSettings',
  ])) as Partial<ScheduleStorageData>;

  const settings = data.settings ?? DEFAULT_SETTINGS;
  const schedule = data.schedule ?? [];
  const scheduleActive = data.scheduleActive ?? false;
  const isScheduleOverriding = data.isScheduleOverriding ?? false;
  const manualSettings = data.manualSettings ?? null;

  if (!scheduleActive || schedule.length === 0) {
    if (isScheduleOverriding && manualSettings) {
      await chrome.storage.sync.set({
        settings: manualSettings,
        isScheduleOverriding: false,
        manualSettings: null,
      });
    }
    return;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const activeEntry = schedule.find((entry: ScheduleEntry) => {
    if (!entry.enabled) return false;
    if (!entry.days.includes(currentDay)) return false;

    if (entry.startTime <= entry.endTime) {
      return currentTime >= entry.startTime && currentTime <= entry.endTime;
    } else {
      return currentTime >= entry.startTime || currentTime <= entry.endTime;
    }
  });

  if (activeEntry) {
    if (!isScheduleOverriding) {
      await chrome.storage.sync.set({ manualSettings: settings });
    }
    await chrome.storage.sync.set({
      settings: activeEntry.settings,
      isScheduleOverriding: true,
    });
  } else if (isScheduleOverriding) {
    if (manualSettings) {
      await chrome.storage.sync.set({
        settings: manualSettings,
        isScheduleOverriding: false,
        manualSettings: null,
      });
    } else {
      await chrome.storage.sync.set({ isScheduleOverriding: false });
    }
  }
}
