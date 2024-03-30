export async function getActiveTabURL() {     //grabs active tab
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });

    return tabs[0];
}