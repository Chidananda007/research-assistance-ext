document.addEventListener('DOMContentLoaded', () => {
    // Load saved notes and results
    chrome.storage.local.get(['researchNotes', 'lastResults'], function(data) {
        if (data.researchNotes) {
            document.getElementById('notes').value = data.researchNotes;
        }
        if (data.lastResults) {
            showResult(data.lastResults);
        }
    });

    // Add event listener for process button
    document.getElementById('processBtn').addEventListener('click', handleProcess);

    // Add event listeners for About Us functionality
    document.getElementById('aboutLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('aboutContent').classList.remove('hidden');
    });

    document.querySelector('.close-about').addEventListener('click', function() {
        document.getElementById('aboutContent').classList.add('hidden');
    });

    // Auto-save notes when typing stops
    let saveTimeout;
    document.getElementById('notes').addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            chrome.storage.local.set({ 'researchNotes': this.value });
        }, 1000); // Save after 1 second of no typing
    });
});

async function handleProcess() {
    const operationType = document.getElementById('operationSelect').value;
    if (!operationType) {
        showResult('Please select an operation type');
        return;
    }

    try {
        showResult('Getting current tab...');
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        
        // Check if the current tab is a restricted URL
        if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
            showResult(`Cannot process text from this page. Please navigate to a regular website and try again.`);
            return;
        }
        
        showResult('Attempting to get selected text...');
        const [result] = await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: () => {
               return window.getSelection().toString();
            }
        });

        let contentToProcess = '';

        if(!result.result || result.result.trim() === ''){
           showResult('No text selected. Getting content from research notes...');
           
           const storageResult = await new Promise((resolve) => {
               chrome.storage.local.get(['researchNotes'], resolve);
           });
           
           if(storageResult.researchNotes && storageResult.researchNotes.trim() !== '') {
               contentToProcess = storageResult.researchNotes;
               showResult(`Using research notes content (${contentToProcess.length} characters)`);
           } else {
               showResult('No text selected and no research notes available. Please select some text or add some research notes first.');
               return;
           }
        } else {
           contentToProcess = result.result;
        }
        
        showResult('Processing content...');
        try {
            const response = await fetch('http://localhost:8050/api/research/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    content: contentToProcess,
                    operationType: operationType
                })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Backend server is not running. Please start the server and try again.');
                } else if (response.status === 500) {
                    const errorData = await response.text();
                    throw new Error(`Server error: ${errorData}`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const text = await response.text();
            showResult(text.replace(/\n/g,'<br>'));

        } catch (fetchError) {
            if (fetchError.message.includes('Failed to fetch')) {
                showResult('Error: Cannot connect to the backend server is not active:<br>');
                console.error('Connection error:', fetchError);
            } else {
                showResult('Error: ' + fetchError.message);
            }
        }

    } catch (error) {
        console.error('Processing error:', error);
        showResult('Error: ' + error.message);
    }
}

async function showResult(content) {
    document.getElementById('results').innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`;
    // Save the result
    chrome.storage.local.set({ 'lastResults': content });
}
