
const KEYS = { SETTINGS: 'settings', LAST_COMPLETED: 'lastCompletedDate' };
const DEFAULT_SETTINGS = { hour: 19, minute: 0, daily: true };
const ALARM_NAME = 'dailyMcqQuiz';

async function getSettings() {
  const { [KEYS.SETTINGS]: settings } = await chrome.storage.local.get(KEYS.SETTINGS);
  return settings || DEFAULT_SETTINGS;
}

function nextTriggerAtLocalTime(hour, minute) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime();
}

async function scheduleAlarm() {
  const settings = await getSettings();
  if (!settings.daily) return;
  const when = nextTriggerAtLocalTime(settings.hour, settings.minute);
  await chrome.alarms.clear(ALARM_NAME);
  chrome.alarms.create(ALARM_NAME, { when, periodInMinutes: 24 * 60 });
}

async function openQuizIfNeeded(force=false) {
  const settings = await getSettings();
  const { [KEYS.LAST_COMPLETED]: lastDate } = await chrome.storage.local.get(KEYS.LAST_COMPLETED);
  const today = new Date().toISOString().slice(0,10);
  if (lastDate === today && !force) return;

  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(settings.hour, settings.minute, 0, 0);
  if (force || now >= scheduled) {
    chrome.tabs.create({ url: chrome.runtime.getURL('quiz.html') });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await scheduleAlarm();
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onStartup.addListener(async () => {
  await scheduleAlarm();
  await openQuizIfNeeded(false);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await openQuizIfNeeded(true);
  }
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (changes[KEYS.SETTINGS]) {
    await scheduleAlarm();
  }
});
