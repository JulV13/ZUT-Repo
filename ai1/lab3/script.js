const loc = document.getElementById("loc");
let map;
let baseLayer;
let userMarker;

window.onload = function(){
    requestNotificationPermission();
    zainicjalizujMape();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                window.userPosition = position;
            },
            function(error) {
                console.log("blad pobrania geolokacji:", error);
            }
        );
    }
    
    document.getElementById('zlokalizujMnie').addEventListener('click', function() {
        if (window.userPosition) {
            pokazLokalizacje(window.userPosition);
        } else {
            getLocation();
        }
    });
    
    document.getElementById('pobierzMape').addEventListener('click', zapiszMapeDoRastra);
    
    wygenerujSiatkePuzli();
}

function zapiszMapeDoRastra() {
    const rastr = document.getElementById('rastr');
    const mapPaneSize = map.getSize();
    const width = mapPaneSize.x;
    const height = mapPaneSize.y;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const tileSize = 256;
    const z = map.getZoom();
    const pixelBounds = map.getPixelBounds();
    const tileRange = L.bounds(
        pixelBounds.min.divideBy(tileSize).floor(),
        pixelBounds.max.divideBy(tileSize).floor()
    );

    const promises = [];
    for (let x = tileRange.min.x; x <= tileRange.max.x; x++) {
        for (let y = tileRange.min.y; y <= tileRange.max.y; y++) {
            const coords = { x: x, y: y, z: z };
            let url;
            try {
                url = baseLayer.getTileUrl(coords);
            } catch (e) {
                url = baseLayer._url.replace('{s}', baseLayer.options.subdomains[0])
                    .replace('{z}', z).replace('{x}', x).replace('{y}', y);
            }

            const px = x * tileSize - pixelBounds.min.x;
            const py = y * tileSize - pixelBounds.min.y;

            promises.push(new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = function() {
                    ctx.drawImage(img, px, py, tileSize, tileSize);
                    resolve();
                };
                img.onerror = function() {
                    ctx.fillStyle = '#333';
                    ctx.fillRect(px, py, tileSize, tileSize);
                    resolve();
                };
                img.src = url;
            }));
        }
    }

    Promise.all(promises).then(() => {
        const img = new Image();
        try {
            img.src = canvas.toDataURL();
        } catch (e) {
            return;
        }
        rastr.innerHTML = '';
        rastr.appendChild(img);
        wygenerujPuzle(img.src);
    });
}

function wygenerujSiatkePuzli() {
    const puzle = document.getElementById('puzle');
    const ukladanka = document.getElementById('ukladanka');
    
    for (let i = 0; i < 16; i++) {
        const slot = document.createElement('div');
        slot.className = 'miejsceNaPuzla';
        slot.dataset.position = i;
        ukladanka.appendChild(slot.cloneNode(true));
    }
    
    dragAndDrop();
}

function wygenerujPuzle(imageSrc) {
    const puzle = document.getElementById('puzle');
    puzle.innerHTML = '';

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        const pieceW = Math.floor(img.width / 4);
        const pieceH = Math.floor(img.height / 4);
        const positions = Array.from({length: 16}, (_, i) => i);
        pomieszajPuzle(positions);

        positions.forEach((pos) => {
            const sx = (pos % 4) * pieceW;
            const sy = Math.floor(pos / 4) * pieceH;

            const canvas = document.createElement('canvas');
            canvas.width = pieceW;
            canvas.height = pieceH;
            const c = canvas.getContext('2d');
            c.drawImage(img, sx, sy, pieceW, pieceH, 0, 0, pieceW, pieceH);

            const piece = document.createElement('div');
            piece.className = 'kawalekUkladanki';
            piece.draggable = true;
            piece.dataset.originalPosition = pos;

            const pieceImg = new Image();
            pieceImg.src = canvas.toDataURL();
            pieceImg.style.width = '100%';
            pieceImg.style.height = '100%';

            pieceImg.draggable = false;
            piece.appendChild(pieceImg);

            puzle.appendChild(piece);
        });

        dragAndDrop();
    };
    img.onerror = function() {
        console.error('nie udalo sie wczytac obrazka rastrowego do puzli');
    };
    img.src = imageSrc;
}

function dragAndDrop() {
    const pieces = document.querySelectorAll('.kawalekUkladanki');
    const slots = document.querySelectorAll('.miejsceNaPuzla');
    const ukladanka = document.getElementById('ukladanka');

    pieces.forEach(piece => {
        piece.removeEventListener('dragstart', dragStart);
        piece.removeEventListener('dragend', dragEnd);
        piece.addEventListener('dragstart', dragStart);
        piece.addEventListener('dragend', dragEnd);
    });

    slots.forEach(slot => {
        slot.removeEventListener('dragover', dragOver);
        slot.removeEventListener('drop', dropPuzzle);
        slot.addEventListener('dragover', dragOver);
        slot.addEventListener('drop', dropPuzzle);
    });

    if (ukladanka) {
        ukladanka.removeEventListener('dragover', dragOver);
        ukladanka.removeEventListener('drop', dropPuzzleOnContainer);
        ukladanka.addEventListener('dragover', dragOver);
        ukladanka.addEventListener('drop', dropPuzzleOnContainer);
    }
}

function dragStart(e) {
    const piece = e.target.closest('.kawalekUkladanki');
    if (!piece) return;
    piece.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', piece.dataset.originalPosition);
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function dropPuzzle(e) {
    e.preventDefault();
    const piecePos = e.dataTransfer.getData('text/plain');
    const piece = document.querySelector(`[data-original-position="${piecePos}"]`);
    let slot = e.target.closest('.miejsceNaPuzla');

    if (!slot) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el) slot = el.closest('.miejsceNaPuzla');
    }

    if (slot) {
        const existing = slot.firstChild;
        if (!existing) {
            slot.appendChild(piece);
        } else if (existing !== piece) {
            const puzle = document.getElementById('puzle');
            puzle.appendChild(existing);
            slot.appendChild(piece);
        }
        sprawdzUlozeniePuzli();
    }
}

function dropPuzzleOnContainer(e) {
    e.preventDefault();
    const piecePos = e.dataTransfer.getData('text/plain');
    const piece = document.querySelector(`[data-original-position="${piecePos}"]`);

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const slot = el ? el.closest('.miejsceNaPuzla') : null;
    if (slot && !slot.hasChildNodes()) {
        slot.appendChild(piece);
        sprawdzUlozeniePuzli();
    }
}

function sprawdzUlozeniePuzli() {
    const slots = document.querySelectorAll('#ukladanka .miejsceNaPuzla');
    let isComplete = true;

    slots.forEach((slot) => {
        const piece = slot.firstChild;
        const slotPos = slot.dataset.position;
        if (!piece || piece.dataset.originalPosition !== slotPos) {
            isComplete = false;
        }
    });

    if (isComplete) {
        console.log('Ukladanka ulozona poprawnie!');
        sendNotification('Brawo!', 'Ukladanka ulozona poprawnie!');
    }
}

function pomieszajPuzle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function zainicjalizujMape() {
    map = L.map('mapa').setView([52.0693, 19.4803], 6);
    
    baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function getLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pokazLokalizacje, noLocation);
    } else {
        loc.innerHTML = "Przegladarka nie wspiera geolokacji.";
    }
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        return;
    }

    Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
            console.log("Powiadomienia zezwolone");
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

function pokazLokalizacje(position) {
    loc.innerHTML = "<br>Twoja lokalizacja:<br>" + "Szerokosc geograficzna: " + position.coords.latitude +
    "<br>Dlugosc geograficzna: " + position.coords.longitude;
    
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    
    userMarker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 13);
}

function noLocation() {
    alert("Brak geolokacji!");
}