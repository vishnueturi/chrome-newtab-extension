(function () {
    try {
        if (new URLSearchParams(window.location.search).get("nt") === "1") return;
        if (sessionStorage.getItem("ntp") === "1") return;
        if (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.getURL === "function") {
            location.replace(chrome.runtime.getURL("new-tab/index.html") + "?nt=1");
        }
    } catch (_) {}
})();
