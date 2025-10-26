const loc = document.getElementById("loc");
let map;
let userMarker;

window.onload = function(){
    requestNotificationPermission();
    initMap();
    getLocation();
    
    document.getElementById('locateMe').addEventListener('click', function() {
        displayLocation();
    });
}

function initMap() {
    map = L.map('map').setView([52.0693, 19.4803], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function getLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayLocation, noLocation);
    } else {
        loc.innerHTML = "Przegladarka nie wspiera geolokacji.";
    }
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("Przegladarka nie wspiera powiadomien.");
        return;
    }

    Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
            sendNotification("Witaj!", "Powiadomienia zostaly aktywowane.");
        }
    });
}

function sendNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5H4v2h16v-2h-2z'/%3E%3C/svg%3E"
        });
    }
}

function displayLocation(position) {
    loc.innerHTML = "<br>Twoja lokalizacja:<br>" + "Szerokosc geograficzna: " + position.coords.latitude +
    "<br>Dlugosc geograficzna: " + position.coords.longitude;
    
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    
    userMarker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 13);
    
    if (Notification.permission === "granted") {
        sendNotification("Lokalizacja znaleziona!", 
            `Szerokość: ${position.coords.latitude}\nDługość: ${position.coords.longitude}`);
    }
}

function noLocation() {
    alert("Brak pozycji.");
    if (Notification.permission === "granted") {
        sendNotification("Błąd lokalizacji", "Nie udało się uzyskać pozycji.");
    }
}