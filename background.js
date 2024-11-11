let tabHistory = [];

// Track tab activation
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId);

  if (tab.incognito) return;

  tabHistory = tabHistory.filter((id) => id !== activeInfo.tabId);
  tabHistory.unshift(activeInfo.tabId);
  tabHistory = tabHistory.slice(0, 2); // Keep only last 2 tabs
});

// Handle tab closing
browser.tabs.onRemoved.addListener((tabId) => {
  tabHistory = tabHistory.filter((id) => id !== tabId);
});

// Toggle between tabs
browser.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-tabs" && tabHistory.length >= 2) {
    [tabHistory[0], tabHistory[1]] = [tabHistory[1], tabHistory[0]];
    await browser.tabs.update(tabHistory[0], { active: true });
  }
});
