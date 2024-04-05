(() => {
    console.log("i have been injected") // just making sure
   
    var recorder = null;
    var recordedChunks = []
    function onAccessApproved(stream){
        recordedChunks = []
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = function(event){
            // Push each chunk of recorded audio data into the recordedChunks array
            recordedChunks.push(event.data);
        
        }
        
        
        recorder.onstop = function(){
            console.log("Recording stopped");
            // Concatenate all recorded chunks into a single Blob
            const completeBlob = new Blob(recordedChunks, { type: 'audio/webm' });
            console.log("Complete Blob created:", completeBlob);
    
            // Create URL for the entire recording
            const blobURL = URL.createObjectURL(completeBlob);
    
            // Store the URL in local storage
            chrome.storage.local.set({ 'audioBlobURL': blobURL }, function() {
                console.log('Blob URL stored in local storage');
            });
            
            // Stop all tracks in the stream
            stream.getTracks().forEach(function(track){
                if(track.readyState === 'live'){
                    track.stop();
                }
            });
            // Reset recordedChunks array for future recordings
            
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
   
    const cuurretTabURL = "";
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, tabURL,action}= obj; //desctructure object             //imma have to chaneg this stuff form url to the tab
        if(type ==="NEW"){
            cuurretTabURL = tabURL;
           
      
    }
    else if(action === 'request_audio'){
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
        response(`processed: ${action}`);
        if(!recorder){
            return console.log("no recorder yet")
        }else{
            recorder.stop(); //goes to the stop methode in onAccessApproved() fucntion
        }
        


    }




}); 
        
   
})();
