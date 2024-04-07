
(() => {
    console.log("i have been injected") // just making sure
   
    var recorder = null;
    let tab;
    let recordedChunks = [];
function onAccessApproved(stream) {
    
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = function(event) {
        // Push each chunk of recorded audio data into the recordedChunks array
        console.log("Data available. Chunk size:", event.data.size);
        recordedChunks.push(event.data);
        console.log("Total recordedChunks length:", recordedChunks.length);
    }

    recorder.onstop = function() {
        console.log("Recording stopped");
        // Concatenate all recorded chunks into a single Blob
        const completeBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        console.log("Complete Blob created:", completeBlob);

        // Stop all tracks in the stream
        stream.getTracks().forEach(function(track) {
            if (track.readyState === 'live') {
                track.stop();
            }
        });

        // Reset recordedChunks array for future recordings
        recordedChunks = [];

        // Create URL for the entire recording
        const blobURL = URL.createObjectURL(completeBlob);

        // Store the URL in local storage
        const tabID = tab.toString();
        const storagePromise = new Promise((resolve, reject) => {
            chrome.storage.local.set({ [tabID]: blobURL }, function() { // tab is from sender
                if (chrome.runtime.lastError) {
                    console.error('Error storing Blob URL in local storage:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log(`Blob URL put in local storage at key ${tabID} `);
                    console.log("blobURL: "+blobURL)
                    resolve();
                }
            });
        });

        storagePromise.catch(error => {
            console.error('Error storing Blob URL in local storage:', error);
        });
    }

    recorder.start();
}


document.addEventListener("mouseup",function(){
console.log('mouseup on page ')
    const selection = window.getSelection();
const selectedText = selection.toString().trim()
console.log(selectedText);

if (selectedText !==''){
    chrome.storage.sync.set({["highlightedV"]:JSON.stringify(selectedText)});
    chrome.runtime.sendMessage({ 
    type: "DOMtext"
});
}   
} );   
   
    
    chrome.runtime.onMessage.addListener(async (request, sender, response) => {
        const {type,tabId,action}= request; //desctructure object             //imma have to chaneg this stuff form url to the tab
        
         // this is at the top of the code

        if(type ==="NEW"){
            tab =tabId; // at top of code
            console.log("Received 'NEW' message from background script");
            console.log(tab)
            response("Response from content script");
           
      }else if(action === 'request_audio'){
        console.log("request recording");
        response(`processed: ${action}`);

        navigator.mediaDevices.getUserMedia({ //this returns a promise of the media stream
            audio:{
                noiseSuppression:true
            }
            
        }).then((stream)=>{
            onAccessApproved(stream); 
        })


    }
    else if(action === 'stop_audio'){
        console.log("request stop recording");
        
        if(!recorder){
            return console.log("no recorder yet")
        }else{
            await recorder.stop(); //goes to the stop methode in onAccessApproved() fucntion
            response(`processed: ${action}`);
        }
        


    }




}); 
        
   
})();
