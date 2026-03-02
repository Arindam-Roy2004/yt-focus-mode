

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

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

function applySettings(settings: Settings): void {
  const html = document.documentElement;
  for (const key of SETTING_KEYS) {
    html.setAttribute(
      `data-ytfocus-${key.toLowerCase()}`,
      String(settings[key])
    );
  }
}

chrome.storage.sync.get({ settings: DEFAULT_SETTINGS }, (result: Record<string, unknown>) => {
  applySettings(result.settings as Settings);
});

chrome.storage.onChanged.addListener(
  (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
    if (area === 'sync' && changes.settings) {
      applySettings(changes.settings.newValue as Settings);
    }
  }
);

chrome.runtime.onMessage.addListener((message: Record<string, unknown>) => {
  if (message.type === 'APPLY_SETTINGS' && message.settings) {
    applySettings(message.settings as Settings);
  }
});
