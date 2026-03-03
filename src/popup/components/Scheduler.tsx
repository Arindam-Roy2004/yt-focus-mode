import React, { useState } from 'react';
import { ScheduleEntry, Settings, DEFAULT_SETTINGS } from '../../utils/defaults';
import { generateId } from '../../utils/storage';
import ToggleSwitch from './ToggleSwitch';
import './Scheduler.css';

interface SchedulerProps {
  schedule: ScheduleEntry[];
  scheduleActive: boolean;
  isScheduleOverriding: boolean;
  onScheduleChange: (schedule: ScheduleEntry[], active: boolean) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SETTING_LABELS: { key: keyof Settings; label: string }[] = [
  { key: 'hideHomeFeed', label: 'Homepage Feed' },
  { key: 'hideSidebar', label: 'Sidebar' },
  { key: 'hideComments', label: 'Comments' },
  { key: 'hideShorts', label: 'Shorts' },
  { key: 'hideEndScreen', label: 'End Screen' },
  { key: 'hideMiniPlayer', label: 'Mini Player' },
  { key: 'hideLiveChat', label: 'Live Chat' },
  { key: 'hideNotifications', label: 'Notifications' },
  { key: 'hideTrending', label: 'Trending' },
  { key: 'hideAutoplay', label: 'Autoplay' },
];

const Scheduler: React.FC<SchedulerProps> = ({
  schedule,
  scheduleActive,
  isScheduleOverriding,
  onScheduleChange,
}) => {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const addEntry = () => {
    const newEntry: ScheduleEntry = {
      id: generateId(),
      enabled: true,
      days: [1, 2, 3, 4, 5], 
      startTime: '09:00',
      endTime: '17:00',
      settings: {
        ...DEFAULT_SETTINGS,
        hideHomeFeed: true,
        hideSidebar: true,
        hideShorts: true,
        hideComments: true,
      },
    };
    const updated = [...schedule, newEntry];
    onScheduleChange(updated, scheduleActive);
    setExpandedEntry(newEntry.id);
  };

  const removeEntry = (id: string) => {
    const updated = schedule.filter((e) => e.id !== id);
    onScheduleChange(updated, scheduleActive);
    if (expandedEntry === id) setExpandedEntry(null);
  };

  const updateEntry = (id: string, patch: Partial<ScheduleEntry>) => {
    const updated = schedule.map((e) =>
      e.id === id ? { ...e, ...patch } : e
    );
    onScheduleChange(updated, scheduleActive);
  };

  const toggleDay = (entryId: string, day: number) => {
    const entry = schedule.find((e) => e.id === entryId);
    if (!entry) return;
    const days = entry.days.includes(day)
      ? entry.days.filter((d) => d !== day)
      : [...entry.days, day].sort();
    updateEntry(entryId, { days });
  };

  const updateEntrySetting = (
    entryId: string,
    key: keyof Settings,
    value: boolean
  ) => {
    const entry = schedule.find((e) => e.id === entryId);
    if (!entry) return;
    updateEntry(entryId, {
      settings: { ...entry.settings, [key]: value },
    });
  };

  return (
    <div className="scheduler">
      <div className="scheduler-header">
        <ToggleSwitch
          id="schedule-active"
          label="Enable Scheduler"
          checked={scheduleActive}
          onChange={(checked) => onScheduleChange(schedule, checked)}
        />
      </div>

      {isScheduleOverriding && (
        <div className="schedule-status active">
          ● Schedule active — settings overridden
        </div>
      )}

      {scheduleActive && (
        <>
          <div className="schedule-entries">
            {schedule.map((entry) => (
              <div
                key={entry.id}
                className={`schedule-entry ${!entry.enabled ? 'entry-disabled' : ''}`}
              >
                <div
                  className="entry-header"
                  onClick={() =>
                    setExpandedEntry(
                      expandedEntry === entry.id ? null : entry.id
                    )
                  }
                >
                  <div className="entry-summary">
                    <span className="entry-time">
                      {entry.startTime} — {entry.endTime}
                    </span>
                    <span className="entry-days">
                      {entry.days.map((d) => DAY_LABELS[d]).join(', ')}
                    </span>
                  </div>
                  <div className="entry-actions">
                    <button
                      className={`entry-toggle-btn ${entry.enabled ? 'on' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateEntry(entry.id, { enabled: !entry.enabled });
                      }}
                      title={entry.enabled ? 'Disable' : 'Enable'}
                    >
                      {entry.enabled ? '●' : '○'}
                    </button>
                    <button
                      className="entry-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEntry(entry.id);
                      }}
                      title="Delete"
                    >
                      ✕
                    </button>
                    <span className={`chevron ${expandedEntry === entry.id ? 'open' : ''}`}>
                      ▸
                    </span>
                  </div>
                </div>

                {expandedEntry === entry.id && (
                  <div className="entry-details">
                    {}
                    <div className="day-picker">
                      {DAY_LABELS.map((label, idx) => (
                        <button
                          key={idx}
                          className={`day-btn ${entry.days.includes(idx) ? 'selected' : ''}`}
                          onClick={() => toggleDay(entry.id, idx)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {}
                    <div className="time-pickers">
                      <label>
                        <span>Start</span>
                        <input
                          type="time"
                          value={entry.startTime}
                          onChange={(e) =>
                            updateEntry(entry.id, {
                              startTime: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        <span>End</span>
                        <input
                          type="time"
                          value={entry.endTime}
                          onChange={(e) =>
                            updateEntry(entry.id, {
                              endTime: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>

                    {}
                    <div className="entry-settings">
                      <div className="entry-settings-title">Hide during this schedule:</div>
                      {SETTING_LABELS.map(({ key, label }) => (
                        <ToggleSwitch
                          key={key}
                          id={`sched-${entry.id}-${key}`}
                          label={label}
                          checked={entry.settings[key]}
                          onChange={(val) =>
                            updateEntrySetting(entry.id, key, val)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="add-entry-btn" onClick={addEntry}>
            + Add Schedule
          </button>
        </>
      )}
    </div>
  );
};

export default Scheduler;
