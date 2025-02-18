var editor;
var data;
var host;
var key;
var enabled;
var library;

function extractHostname(url) {
    try {
        const { hostname } = new URL(url);
        return hostname;
    }
    catch(_) {
        return undefined;
    }
}

function saveChanges(dont_run) {
    var _code = editor.getValue();
    var js = { 'code': _code, 'enabled': enabled, 'library': library };

    if(_code == undefined || _code == 'undefined') {
        js = { 'code': '', 'enabled': 'true', 'library': 'jquery_3_3_1' };
    }

    //set the library again...
    library = document.getElementById('slLibrary').value;

    var _data = new Object();
    _data['runjavascript_' + host] = js;

    chrome.storage.sync.set(_data, function() { });

    if(typeof dont_run === 'undefined') {
        //stop toggleOnHost from running the script again!
    }
    else {
        if(enabled) {
            chrome.tabs.executeScript(null, {
                code: js.code
            });
        }
    }
    document.getElementById("lblUpdated").style.display = "inline-block";

    setTimeout(function() {
        document.getElementById("lblUpdated").style.display = "none";
    }, 2000);
}

function showRightToggleOnHostButton() {
    document.getElementById('chkToggleOnHost').checked = !(!enabled);
}

function toggleOnHost() {
    enabled = !enabled;
    showRightToggleOnHostButton();
    saveChanges(true);
}

function setLibrary() {
    library = document.getElementById('slLibrary').value;
    saveChanges(true);
}

function update_ace_placeholder() {
    var shouldShow = !editor.session.getValue().length;
    var node = editor.renderer.emptyMessageNode;
    var node2 = editor.renderer.emptyMessageNode2;

    if(!shouldShow && node) {
        editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode);
        editor.renderer.emptyMessageNode = null;

        editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode2);
        editor.renderer.emptyMessageNode2 = null;

        editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode3);
        editor.renderer.emptyMessageNode3 = null;
    }
    else if(shouldShow && !node) {
        node = editor.renderer.emptyMessageNode = document.createElement("div");
        node.textContent = "Add your Javascript here and click 'Save and Run'"
        node.className = "ace_invisible ace_emptyMessage"
        node.style.padding = "0px 5px 5px 5px"
        editor.renderer.scroller.appendChild(node);

        node2 = editor.renderer.emptyMessageNode2 = document.createElement("div");
        node2.textContent = "jQuery 3.3.1 is loaded, so you can use all your favourite $ shortcuts!"
        node2.className = "ace_invisible ace_emptyMessage"
        node2.style.padding = "10px 5px 5px 5px"
        editor.renderer.scroller.appendChild(node2);

        node3 = editor.renderer.emptyMessageNode3 = document.createElement("div");
        node3.textContent = "It will be run now and everytime you visit this domain again in the future!"
        node3.className = "ace_invisible ace_emptyMessage"
        node3.style.padding = "20px 5px 5px 5px"
        editor.renderer.scroller.appendChild(node3);
    }
}

chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, function(tabs) {
    console.log('popup: on chrome.tabs.query callback');

    var tab = tabs[0];
    if(tab) {
        host = extractHostname(tab.url);
        key = `runjavascript_${host}`;

        document.getElementById('_toggle_host_name').innerHTML = host;
        showRightToggleOnHostButton();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('popup: on DOMContentLoaded');

    editor = ace.edit("editor");
    document.getElementById('runJavascript').addEventListener('click', saveChanges);
    document.getElementById('chkToggleOnHost').addEventListener('change', toggleOnHost);
    document.getElementById('slLibrary').addEventListener('change', setLibrary);



    editor.on("input", update_ace_placeholder);
    setTimeout(update_ace_placeholder, 100);
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(function(obj) {
        console.log('popup: on chrome.storage.sync.get');

        var js = obj['runjavascript_' + host];
        if(typeof js == 'string') {
            js = { 'code': js, 'enabled': 'true', 'library': '' };
        }
        if(typeof js == undefined) {
            js = { 'code': '', 'enabled': 'true', 'library': '' };
        }
        enabled = js && js.enabled ? js.enabled : false;
        showRightToggleOnHostButton();
        editor.setValue(js && js.code ? js.code : "");
        library = js && js.library ? js.library : "";
        document.getElementById('slLibrary').value = library;
    });
});