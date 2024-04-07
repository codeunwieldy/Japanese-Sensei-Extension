chrome.tabs.onUpdated.addListener((tabID, changeInfo) => {
    if (changeInfo.status === 'complete') { // Check if the tab has finished loading
        chrome.tabs.sendMessage(tabID, {
            type: "NEW",                      // Type of the event
            tabId: tabID                     // Unique tab id we will be storing
        }, function(response) {
            console.log("Message sent to content script");
            console.log("Response from content script: " + response);
        });
    }
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    const {type}= request;
    if (type === 'GET_API_KEY') {
            const apiKey = "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";
            sendResponse({ apiKey: apiKey });
        }
});


