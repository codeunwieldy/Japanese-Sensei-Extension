(() => {
   const cuurretTabURL = "";
    chrome.runtime.onMessage.addListener((obj, sender, responce) => {
        const {type, tabURL}= obj; //desctructure object             //imma have to chaneg this stuff form url to the tab
        if(type ==="NEW"){
            cuurretTabURL = tabURL;
            highlightedV = "highlightedV"
            document.addEventListener("mouseup",function(){
            const selection = window.getSelection();
            const selectedText = selection.toString().trim()

            if (selectedText !==''){
                chrome.storage.sync.set({[highlightedV]:JSON.stringify(selectedText)});
                chrome.runtime.sendMessage({ 
                type: "DOMtext", 
            });
        }   
    } );   
      
    }
}); 
        
   
})();
