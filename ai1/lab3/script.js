const loc = document.getElementById("loc");
let map;
let baseLayer;
let userMarker;

window.onload = function(){
    uprawnieniaLokalizacji();
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
            pobierzLokalizacje();
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
                url = baseLayer._url.replace('{s}', baseLayer.options.subdomains[0]).replace('{z}', z).replace('{x}', x).replace('{y}', y);
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

        const ukladanka = document.getElementById('ukladanka');
        if (ukladanka) {
            ukladanka.innerHTML = '';
            for (let i = 0; i < 16; i++) {
                const slot = document.createElement('div');
                slot.className = 'miejsceNaPuzla';
                slot.dataset.position = i;
                ukladanka.appendChild(slot);
            }
        }

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
        ukladanka.removeEventListener('drop', upuscPuzelDoKontenera);
        ukladanka.addEventListener('dragover', dragOver);
        ukladanka.addEventListener('drop', upuscPuzelDoKontenera);
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

function upuscPuzelDoKontenera(e) {
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
        wyslijPowiadomienie('Brawo!', 'Udalo ci sie poprawnie ulozyc ukladanke!');
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

function pobierzLokalizacje(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pokazLokalizacje, function () {
            alert("Blad pobrania geolokacji.");
        });
    } else {
        loc.innerHTML = "Przegladarka nie wspiera geolokacji.";
    }
}

function uprawnieniaLokalizacji() {
    if (!("Notification" in window)) {
        return;
    }

    Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
            console.log("Powiadomienia zezwolone");
        }
    });
}

function wyslijPowiadomienie(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message
        });
    }
}

function pokazLokalizacje(position) {
    loc.innerHTML = "<br>Twoja lokalizacja:<br>" + "Szerokosc: " + position.coords.latitude +
    "<br>Dlugosc: " + position.coords.longitude;
    
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    
    userMarker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 13);
}