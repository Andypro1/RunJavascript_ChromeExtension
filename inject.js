const runStoredJs = function(e) {
    chrome.storage.sync.get((obj) => {
        const js = obj[`runjavascript_${location.host}`];

         if(js)
            eval(js.code);
    });
};

//  Wait until the document is complete before running any scripts for this page
if(document.readyState === 'complete')
    runStoredJs();
else
    document.addEventListener('readystatechange', e => {
        if(e.target.readyState === 'complete')
            runStoredJs();
    });