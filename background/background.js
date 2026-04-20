const DAY_TRACKER_INSTALLED_AT = "dayTrackerInstalledAt";

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason !== "install") return;
    chrome.storage.local.get([DAY_TRACKER_INSTALLED_AT], (result) => {
        if (result[DAY_TRACKER_INSTALLED_AT] == null) {
            chrome.storage.local.set({ [DAY_TRACKER_INSTALLED_AT]: Date.now() });
        }
    });
});
