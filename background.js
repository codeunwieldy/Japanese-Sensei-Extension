chrome.tabs.onUpdated.addListener((changeInfo, tab) => {
    if (changeInfo.status === 'complete') { // Check if the tab has finished loading
        const urlParameters = tab.url; 
        chrome.runtime.sendMessage({
            type: "NEW",                      // Type of the event
            tabURL: urlParameters             // Unique video id we will be storing
        });
    }
});

let currentURL = "";
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    const {type, tabURL}= request;
    if (type === 'GET_API_KEY') {
            const apiKey = "";
            sendResponse({ apiKey: apiKey });
        }
    else if(type ==='SEND'){
        console.log("Received SEND message.");
    }
    
    
});


