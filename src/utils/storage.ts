import { StorageData, Settings, ScheduleEntry, DEFAULT_STORAGE } from './defaults';

export async function getStorageData(): Promise<StorageData> {
  return new Promise((resolve) => {
    const keys = Object.keys(DEFAULT_STORAGE) as (keyof StorageData)[];
    chrome.storage.sync.get(keys, (result) => {
      resolve({
        ...DEFAULT_STORAGE,
        ...result,
      } as StorageData);
    });
  });
}

export async function saveSettings(settings: Settings): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ settings }, () => resolve());
  });
}

export async function saveSchedule(
  schedule: ScheduleEntry[],
  scheduleActive: boolean
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ schedule, scheduleActive }, () => resolve());
  });
}

export async function setScheduleOverriding(isOverriding: boolean): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ isScheduleOverriding: isOverriding }, () => resolve());
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
