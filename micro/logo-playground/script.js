// ----- Canvas & Kontext -----
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ----- State -----
let elements = [];
let selectedIndex = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let nextId = 1;

// ----- DOM-Referenzen -----
const colorPicker = document.getElementById('colorPicker');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const rotationSlider = document.getElementById('rotationSlider');
const rotationValue = document.getElementById('rotationValue');
const posX = document.getElementById('posX');
const posY = document.getElementById('posY');
const layerList = document.getElementById('layerList');
const fillRadios = document.querySelectorAll('input[name="fillType"]');

// ----- Hilfsfunktionen -----
function getRandomId() {
    return nextId++;
}

function getFillType() {
    for (const radio of fillRadios) {
        if (radio.checked) return radio.value;
    }
    return 'fill';
}

function getDefaultProps(shape) {
    const base = {
        id: getRandomId(),
        shape: shape,
        x: 300,
        y: 200,
        size: 60,
        color: colorPicker.value,
        rotation: 0,
        fillType: 'fill',
    };
    // Für Linie: andere Standardgröße
    if (shape === 'line') {
        base.size = 80;
    }
    return base;
}

// ----- Zeichenfunktionen -----
function drawShape(elem) {
    const { shape, x, y, size, color, rotation, fillType } = elem;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation || 0) * Math.PI / 180);

    ctx.beginPath();

    switch (shape) {
        case 'rect':
            ctx.rect(-size/2, -size/2, size, size);
            break;
        case 'circle':
            ctx.arc(0, 0, size/2, 0, Math.PI * 2);
            break;
        case 'triangle':
            ctx.moveTo(0, -size/2);
            ctx.lineTo(-size/2, size/2);
            ctx.lineTo(size/2, size/2);
            ctx.closePath();
            break;
        case 'star':
            drawStar(ctx, 0, 0, 5, size/2, size/4);
            break;
        case 'line':
            ctx.moveTo(-size/2, 0);
            ctx.lineTo(size/2, 0);
            break;
        default:
            ctx.rect(-size/2, -size/2, size, size);
    }

    ctx.closePath();

    if (fillType === 'fill') {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    ctx.restore();
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = -Math.PI / 2;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx + outerRadius * Math.cos(rot), cy + outerRadius * Math.sin(rot));
    for (let i = 1; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = rot + i * step;
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    ctx.closePath();
}

// ----- Render-Funktion -----
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Zeichne weiches Gitter (Hintergrund)
    ctx.save();
    ctx.strokeStyle = '#f0f4ff';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.restore();

    // Zeichne alle Elemente
    for (const elem of elements) {
        drawShape(elem);
    }

    // Markiere das ausgewählte Element
    if (selectedIndex !== null && elements[selectedIndex]) {
        const elem = elements[selectedIndex];
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(elem.x - elem.size/2 - 6, elem.y - elem.size/2 - 6, elem.size + 12, elem.size + 12);
        ctx.restore();
    }

    updateLayerList();
    updateProperties();
}

// ----- Layer-Liste aktualisieren -----
function updateLayerList() {
    if (elements.length === 0) {
        layerList.innerHTML = '<p class="empty-message">Noch keine Elemente</p>';
        return;
    }

    const shapeNames = {
        rect: 'Rechteck',
        circle: 'Kreis',
        triangle: 'Dreieck',
        star: 'Stern',
        line: 'Linie',
        text: 'Text',
    };

    layerList.innerHTML = elements.map((elem, idx) => {
        const isActive = idx === selectedIndex;
        const label = shapeNames[elem.shape] || elem.shape;
        return `
            <div class="layer-item ${isActive ? 'active' : ''}" data-index="${idx}">
                <span class="color-dot" style="background: ${elem.color};"></span>
                <span class="layer-label">${label} #${elem.id}</span>
            </div>
        `;
    }).join('');

    // Click-Event für Layer-Auswahl
    document.querySelectorAll('.layer-item').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.index, 10);
            if (!isNaN(idx) && idx >= 0 && idx < elements.length) {
                selectedIndex = idx;
                render();
            }
        });
    });
}

// ----- Eigenschaften im Panel aktualisieren -----
function updateProperties() {
    const elem = selectedIndex !== null ? elements[selectedIndex] : null;
    if (!elem) {
        // Felder leeren oder disabled setzen? Wir lassen sie einfach.
        return;
    }

    colorPicker.value = elem.color;
    sizeSlider.value = elem.size;
    sizeValue.textContent = elem.size;
    rotationSlider.value = elem.rotation || 0;
    rotationValue.textContent = (elem.rotation || 0) + '°';
    posX.value = Math.round(elem.x);
    posY.value = Math.round(elem.y);

    // Fill-Typ
    for (const radio of fillRadios) {
        radio.checked = radio.value === (elem.fillType || 'fill');
    }
}

// ----- Elemente erstellen -----
function addElement(shape) {
    const props = getDefaultProps(shape);
    elements.push(props);
    selectedIndex = elements.length - 1;
    render();
}

// ----- Text-Element -----
function addTextElement() {
    const text = prompt('Gib deinen Text ein:', 'Logo');
    if (text === null || text.trim() === '') return;

    const props = {
        id: getRandomId(),
        shape: 'text',
        x: 300,
        y: 200,
        size: 40,
        color: colorPicker.value,
        rotation: 0,
        fillType: 'fill',
        text: text.trim(),
    };
    elements.push(props);
    selectedIndex = elements.length - 1;
    render();
}

// ----- Zeichnen für Text (überschrieben) -----
// Wir patchen drawShape für Text
const originalDrawShape = drawShape;
drawShape = function(elem) {
    if (elem.shape === 'text') {
        ctx.save();
        ctx.translate(elem.x, elem.y);
        ctx.rotate((elem.rotation || 0) * Math.PI / 180);
        ctx.fillStyle = elem.color;
        ctx.font = `${elem.size}px "Fredoka", "Montserrat", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(elem.text || 'Text', 0, 0);
        ctx.restore();
        return;
    }
    originalDrawShape(elem);
};

// ----- Export als PNG -----
function exportPng() {
    const link = document.createElement('a');
    link.download = 'logo-design.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ----- Canvas löschen -----
function clearCanvas() {
    if (elements.length === 0) return;
    if (confirm('Alle Elemente wirklich löschen?')) {
        elements = [];
        selectedIndex = null;
        render();
    }
}

// ----- Element bewegen (Drag & Drop) -----
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function handleCanvasDown(e) {
    e.preventDefault();
    const pos = getMousePos(e);

    // Finde das oberste Element an dieser Position (von hinten nach vorne)
    let foundIdx = -1;
    for (let i = elements.length - 1; i >= 0; i--) {
        const elem = elements[i];
        // Einfache Hit-Test: ob Punkt innerhalb der Bounding-Box liegt
        const half = elem.size / 2;
        if (pos.x >= elem.x - half && pos.x <= elem.x + half &&
            pos.y >= elem.y - half && pos.y <= elem.y + half) {
            foundIdx = i;
            break;
        }
    }

    if (foundIdx !== -1) {
        selectedIndex = foundIdx;
        isDragging = true;
        const elem = elements[foundIdx];
        dragOffsetX = pos.x - elem.x;
        dragOffsetY = pos.y - elem.y;
        render();
    } else {
        // Klick auf leeren Bereich → Auswahl aufheben
        selectedIndex = null;
        render();
    }
}

function handleCanvasMove(e) {
    e.preventDefault();
    if (!isDragging || selectedIndex === null) return;
    const pos = getMousePos(e);
    const elem = elements[selectedIndex];
    elem.x = Math.max(0, Math.min(canvas.width, pos.x - dragOffsetX));
    elem.y = Math.max(0, Math.min(canvas.height, pos.y - dragOffsetY));
    render();
}

function handleCanvasUp(e) {
    e.preventDefault();
    isDragging = false;
}

// ----- Event Listener für Canvas (Maus & Touch) -----
canvas.addEventListener('mousedown', handleCanvasDown);
canvas.addEventListener('mousemove', handleCanvasMove);
canvas.addEventListener('mouseup', handleCanvasUp);
canvas.addEventListener('mouseleave', handleCanvasUp);

canvas.addEventListener('touchstart', handleCanvasDown, { passive: false });
canvas.addEventListener('touchmove', handleCanvasMove, { passive: false });
canvas.addEventListener('touchend', handleCanvasUp, { passive: false });

// ----- Element-Buttons -----
document.querySelectorAll('.btn-shape').forEach(btn => {
    btn.addEventListener('click', () => {
        addElement(btn.dataset.shape);
    });
});

document.getElementById('addText').addEventListener('click', addTextElement);

// ----- Export & Clear -----
document.getElementById('exportPng').addEventListener('click', exportPng);
document.getElementById('clearCanvas').addEventListener('click', clearCanvas);

// ----- Eigenschaften-Änderungen -----
colorPicker.addEventListener('input', () => {
    if (selectedIndex !== null) {
        elements[selectedIndex].color = colorPicker.value;
        render();
    }
});

sizeSlider.addEventListener('input', () => {
    const val = parseInt(sizeSlider.value, 10);
    sizeValue.textContent = val;
    if (selectedIndex !== null) {
        elements[selectedIndex].size = val;
        render();
    }
});

rotationSlider.addEventListener('input', () => {
    const val = parseInt(rotationSlider.value, 10);
    rotationValue.textContent = val + '°';
    if (selectedIndex !== null) {
        elements[selectedIndex].rotation = val;
        render();
    }
});

fillRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (selectedIndex !== null) {
            elements[selectedIndex].fillType = getFillType();
            render();
        }
    });
});

// ----- Position -----
posX.addEventListener('change', () => {
    if (selectedIndex !== null) {
        elements[selectedIndex].x = Math.max(0, Math.min(canvas.width, parseFloat(posX.value) || 0));
        render();
    }
});

posY.addEventListener('change', () => {
    if (selectedIndex !== null) {
        elements[selectedIndex].y = Math.max(0, Math.min(canvas.height, parseFloat(posY.value) || 0));
        render();
    }
});

document.getElementById('centerElement').addEventListener('click', () => {
    if (selectedIndex !== null) {
        elements[selectedIndex].x = canvas.width / 2;
        elements[selectedIndex].y = canvas.height / 2;
        render();
    }
});

// ----- Layer-Aktionen -----
document.getElementById('moveUp').addEventListener('click', () => {
    if (selectedIndex !== null && selectedIndex < elements.length - 1) {
        [elements[selectedIndex], elements[selectedIndex + 1]] =
        [elements[selectedIndex + 1], elements[selectedIndex]];
        selectedIndex += 1;
        render();
    }
});

document.getElementById('moveDown').addEventListener('click', () => {
    if (selectedIndex !== null && selectedIndex > 0) {
        [elements[selectedIndex], elements[selectedIndex - 1]] =
        [elements[selectedIndex - 1], elements[selectedIndex]];
        selectedIndex -= 1;
        render();
    }
});

document.getElementById('deleteElement').addEventListener('click', () => {
    if (selectedIndex !== null) {
        elements.splice(selectedIndex, 1);
        selectedIndex = elements.length > 0 ? Math.min(selectedIndex, elements.length - 1) : null;
        render();
    }
});

// ----- Tastatur-Shortcuts -----
document.addEventListener('keydown', (e) => {
    // Entf/Backspace löscht ausgewähltes Element
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIndex !== null) {
        elements.splice(selectedIndex, 1);
        selectedIndex = elements.length > 0 ? Math.min(selectedIndex, elements.length - 1) : null;
        render();
        e.preventDefault();
    }
    // Pfeiltasten verschieben das Element
    if (selectedIndex !== null && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const step = e.shiftKey ? 10 : 1;
        const elem = elements[selectedIndex];
        if (e.key === 'ArrowUp') elem.y = Math.max(0, elem.y - step);
        if (e.key === 'ArrowDown') elem.y = Math.min(canvas.height, elem.y + step);
        if (e.key === 'ArrowLeft') elem.x = Math.max(0, elem.x - step);
        if (e.key === 'ArrowRight') elem.x = Math.min(canvas.width, elem.x + step);
        render();
        e.preventDefault();
    }
});

// ----- Initialer Zustand (mit 2 Beispiel-Elementen) -----
function initDemo() {
    const rect = {
        id: getRandomId(),
        shape: 'rect',
        x: 200,
        y: 180,
        size: 80,
        color: '#3b82f6',
        rotation: 15,
        fillType: 'fill',
    };
    const circle = {
        id: getRandomId(),
        shape: 'circle',
        x: 400,
        y: 220,
        size: 70,
        color: '#ef4444',
        rotation: 0,
        fillType: 'fill',
    };
    elements = [rect, circle];
    selectedIndex = 0;
    render();
}

// Starte mit Demo oder leer
initDemo();