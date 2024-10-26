document.addEventListener('DOMContentLoaded', async () => {
  const result = await browser.storage.local.get('settings');
  const settings = result.settings || {
    maxHistory: 2,
    showNotifications: true,
    previewEnabled: true,
    rememberAcrossRestarts: true
  };
  
  // Set initial values
  document.getElementById('showNotifications').checked = settings.showNotifications;
  document.getElementById('previewEnabled').checked = settings.previewEnabled;
  document.getElementById('rememberAcrossRestarts').checked = settings.rememberAcrossRestarts;
  document.getElementById('maxHistory').value = settings.maxHistory;
  
  // Save changes
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', async () => {
      const newSettings = {
        showNotifications: document.getElementById('showNotifications').checked,
        previewEnabled: document.getElementById('previewEnabled').checked,
        rememberAcrossRestarts: document.getElementById('rememberAcrossRestarts').checked,
        maxHistory: parseInt(document.getElementById('maxHistory').value, 10)
      };
      await browser.storage.local.set({ settings: newSettings });
    });
  });
});
