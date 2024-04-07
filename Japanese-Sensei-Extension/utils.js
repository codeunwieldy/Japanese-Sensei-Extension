export async function getActiveTab() {
    // Get the active tab
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    // Ensure tabs array is not empty and return the first tab
    if (tabs && tabs.length > 0) {
        return tabs[0];
    } else {
        throw new Error("Unable to retrieve the active tab");
    }
}