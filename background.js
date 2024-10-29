let tabHistory = [];
let settings = {
  maxHistory: 2,
};

// Load settings
browser.storage.local.get("settings").then((result) => {
  if (result.settings) {
    settings = { ...settings, ...result.settings };
  }
});

// Save tab history for session restore
async function saveTabHistory() {
  if (settings.rememberAcrossRestarts) {
    await browser.storage.local.set({ tabHistory });
  }
}

// Restore tab history
async function restoreTabHistory() {
  if (settings.rememberAcrossRestarts) {
    const result = await browser.storage.local.get("tabHistory");
    if (result.tabHistory) {
      // Verify tabs still exist
      const validTabs = [];
      for (const tabId of result.tabHistory) {
        try {
          await browser.tabs.get(tabId);
          validTabs.push(tabId);
        } catch (e) {
          // Tab no longer exists
        }
      }
      tabHistory = validTabs;
    }
  }
}

// Track tab activation with enhanced history
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId);

  // Don't track private tabs
  if (tab.incognito) return;

  tabHistory = tabHistory.filter((id) => id !== activeInfo.tabId);
  tabHistory.unshift(activeInfo.tabId);
  tabHistory = tabHistory.slice(0, settings.maxHistory);

  await saveTabHistory();
});

// Handle tab closing
browser.tabs.onRemoved.addListener((tabId) => {
  tabHistory = tabHistory.filter((id) => id !== tabId);
  saveTabHistory();
});

// Show preview of target tab
async function showPreview(tabId) {
  if (!settings.previewEnabled) return;

  const tab = await browser.tabs.get(tabId);
  if (settings.showNotifications) {
    browser.notifications.create({
      type: "basic",
      title: "Switching to:",
      message: tab.title,
      iconUrl: tab.favIconUrl || browser.runtime.getURL("icons/toggle-48.png"),
    });
  }
}

// Toggle between tabs with enhanced features
browser.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-tabs" && tabHistory.length >= 2) {
    // Show preview before switching
    await showPreview(tabHistory[1]);

    // Perform the toggle
    [tabHistory[0], tabHistory[1]] = [tabHistory[1], tabHistory[0]];
    await browser.tabs.update(tabHistory[0], { active: true });
    await saveTabHistory();
  } else if (command === "clear-history") {
    tabHistory = [];
    await saveTabHistory();
    if (settings.showNotifications) {
      browser.notifications.create({
        type: "basic",
        title: "Tab History Cleared",
        message: "Tab toggle history has been reset",
        iconUrl: browser.runtime.getURL("icons/toggle-48.png"),
      });
    }
  }
});
