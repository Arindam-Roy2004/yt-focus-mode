import React, { useEffect, useState } from 'react';
import { Settings, ScheduleEntry, DEFAULT_SETTINGS } from '../utils/defaults';
import { getStorageData, saveSettings, saveSchedule } from '../utils/storage';
import ToggleSwitch from './components/ToggleSwitch';
import Scheduler from './components/Scheduler';
import './App.css';

type Tab = 'settings' | 'schedule';

const SETTING_GROUPS: {
  title: string;
  items: { key: keyof Settings; label: string }[];
}[] = [
    {
      title: 'Homepage',
      items: [
        { key: 'hideHomeFeed', label: 'Hide Homepage Feed' },
        { key: 'hideShorts', label: 'Hide Shorts' },
        { key: 'hideTrending', label: 'Hide Trending / Explore' },
      ],
    },
    {
      title: 'Video Page',
      items: [
        { key: 'hideSidebar', label: 'Hide Sidebar Recommendations' },
        { key: 'hideComments', label: 'Hide Comments' },
        { key: 'hideEndScreen', label: 'Hide End Screen' },
        { key: 'hideLiveChat', label: 'Hide Live Chat' },
        { key: 'hideAutoplay', label: 'Hide Autoplay Toggle' },
      ],
    },
    {
      title: 'Global',
      items: [
        { key: 'hideMiniPlayer', label: 'Hide Mini Player' },
        { key: 'hideNotifications', label: 'Hide Notifications' },
      ],
    },
  ];

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [scheduleActive, setScheduleActive] = useState(false);
  const [isScheduleOverriding, setIsScheduleOverriding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getStorageData().then((data) => {
      setSettings(data.settings);
      setSchedule(data.schedule);
      setScheduleActive(data.scheduleActive);
      setIsScheduleOverriding(data.isScheduleOverriding);
      setLoaded(true);
    });

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      if (area !== 'sync') return;
      if (changes.settings) setSettings(changes.settings.newValue as Settings);
      if (changes.isScheduleOverriding)
        setIsScheduleOverriding(changes.isScheduleOverriding.newValue as boolean);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleToggle = (key: keyof Settings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleScheduleChange = (
    newSchedule: ScheduleEntry[],
    active: boolean
  ) => {
    setSchedule(newSchedule);
    setScheduleActive(active);
    saveSchedule(newSchedule, active);
  };

  if (!loaded) {
    return (
      <div className="app loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="app">
      {}
      <header className="app-header">
        <div className="logo-row">
          <span className="logo-icon">◉</span>
          <h1>YT Focus</h1>
        </div>
      </header>

      {}
      <nav className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
      </nav>

      {}
      <main className="content">
        {activeTab === 'settings' && (
          <div className="settings-panel">
            {isScheduleOverriding && (
              <div className="override-notice">
                ⏰ Schedule is active — manual changes won't take effect until the schedule ends
              </div>
            )}
            {SETTING_GROUPS.map((group) => (
              <div key={group.title} className="setting-group">
                <h3 className="group-title">{group.title}</h3>
                {group.items.map(({ key, label }) => (
                  <ToggleSwitch
                    key={key}
                    id={`setting-${key}`}
                    label={label}
                    checked={settings[key]}
                    onChange={(val) => handleToggle(key, val)}
                    disabled={isScheduleOverriding}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'schedule' && (
          <Scheduler
            schedule={schedule}
            scheduleActive={scheduleActive}
            isScheduleOverriding={isScheduleOverriding}
            onScheduleChange={handleScheduleChange}
          />
        )}
      </main>
    </div>
  );
};

export default App;
