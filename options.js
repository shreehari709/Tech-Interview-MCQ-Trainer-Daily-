
const KEYS = { SETTINGS: 'settings' };
const DEFAULT_SETTINGS = { hour: 19, minute: 0, daily: true };

async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  return settings || DEFAULT_SETTINGS;
}

document.addEventListener('DOMContentLoaded', async () => {
  const hour = document.getElementById('hour');
  const minute = document.getElementById('minute');
  const save = document.getElementById('save');
  const saved = document.getElementById('saved');

  const settings = await getSettings();
  hour.value = settings.hour;
  minute.value = settings.minute;

  save.addEventListener('click', async () => {
    const newSettings = {
      hour: Math.max(0, Math.min(23, parseInt(hour.value || '19', 10))),
      minute: Math.max(0, Math.min(59, parseInt(minute.value || '0', 10))),
      daily: true
    };
    await chrome.storage.local.set({ [KEYS.SETTINGS]: newSettings });
    saved.textContent = 'Saved. Your daily session will follow the new time.';
    setTimeout(() => saved.textContent = '', 2500);
  });
});
