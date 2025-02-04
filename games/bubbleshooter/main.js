var swfobject = {};
var ruffleInstance = null; // Store the player instance globally

swfobject.embedSWF = function(url, cont, width, height) {
    var ruffle = window.RufflePlayer.newest();
    var container = document.getElementById(cont);

    // Remove existing player if it exists
    if (ruffleInstance) {
        container.innerHTML = ''; // Clear previous instance
    }

    ruffleInstance = ruffle.createPlayer();
    container.appendChild(ruffleInstance);

    // Set initial size
    ruffleInstance.width = width;
    ruffleInstance.height = height;
    ruffleInstance.style.width = width + "px";
    ruffleInstance.style.height = height + "px";

    ruffleInstance.load({ url: url });
};

function resizeFlash(width, height) {
    if (ruffleInstance) {
        ruffleInstance.width = width;
        ruffleInstance.height = height;
        ruffleInstance.style.width = width + "px";
        ruffleInstance.style.height = height + "px";
    }
};

window.addEventListener("message", (event) => {
    if (event.data.action === "resize") {
        resizeFlash(event.data.width, event.data.height);
    }
});
