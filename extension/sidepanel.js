document.addEventListener('DOMContentLoaded',()=> {
    chrome.storage.local.get(['researchNotes'], function(results){

        if(results.researchNotes && results.researchNotes.length > 0) {
    
            document.getElementById('notes').value = results.researchNotes;

        }

        document.getElementById('summarizeBtn').addEventListener('click', summarizeText); 
        document.getElementById('saveNotesBtn').addEventListener('click', saveNotes); 
        });
    });


async function summarizeText(params) {
    try {
        showResult('Getting current tab...');
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        
        // Debug: Show current URL
        console.log('Current tab URL:', tab.url);
        showResult(`Current tab: ${tab.url || 'No URL available'}`);
        
        // Check if the current tab is a restricted URL (only if we have URL access)
        if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
            showResult(`Cannot summarize text from this page. Current URL: ${tab.url}. Please navigate to a regular website and try again.`);
            return;
        }
        
        showResult('Attempting to get selected text...');
        const [result] = await chrome.scripting.executeScript({

            target: {tabId: tab.id},
            function: () => {
               return window.getSelection().toString();
            }
        });

        console.log('Script execution result:', result);
        showResult(`Selected text: "${result.result || 'No text selected'}"`);

        let contentToSummarize = '';
        
        if(!result.result || result.result.trim() === ''){
           // If no text is selected, get content from local storage
           showResult('No text selected. Getting content from research notes...');
           
           const storageResult = await new Promise((resolve) => {
               chrome.storage.local.get(['researchNotes'], resolve);
           });
           
           if(storageResult.researchNotes && storageResult.researchNotes.trim() !== '') {
               contentToSummarize = storageResult.researchNotes;
               showResult(`Using research notes content (${contentToSummarize.length} characters)`);
           } else {
               showResult('No text selected and no research notes available. Please select some text or add some research notes first.');
               return;
           }
        } else {
           contentToSummarize = result.result;
        }
        
        showResult('Sending request to API...');
        const response = await fetch('http://localhost:8050/api/research/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: contentToSummarize , operationType: 'EXPLAIN'})
        });

            if(!response.ok){
                throw new Error(`API Error: ${response.status}`);
            }

            const text = await response.text();

            showResult(text.replace(/\n/g,'<br>'));

    } catch  (error) {
          console.error('Summarize error:', error);
          showResult('Error : ' + error.message);
    }
}

async function saveNotes(params) {

    const notes = document.getElementById('notes').value;
    chrome.storage.local.set({'researchNotes': notes }, function(){
        alert('Notes saved successfully')
    });
}

async function showResult(content) {
    document.getElementById('results').innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`;
}