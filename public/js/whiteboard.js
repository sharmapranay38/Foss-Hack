'use strict';

const canvas = new fabric.Canvas('whiteboard', {
    isDrawingMode: true, // Enable drawing mode
});

const socket = io.connect();

let isDrawing = false;

// Listen for drawing events on the canvas
canvas.on('mouse:down', (options) => {
    isDrawing = true;
    const pointer = canvas.getPointer(options.e);
    const data = {
        type: 'start',
        x: pointer.x,
        y: pointer.y,
    };
    socket.emit('draw', data); // Send drawing data to the server
});

canvas.on('mouse:move', (options) => {
    if (isDrawing) {
        const pointer = canvas.getPointer(options.e);
        const data = {
            type: 'draw',
            x: pointer.x,
            y: pointer.y,
        };
        socket.emit('draw', data); // Send drawing data to the server
    }
});

canvas.on('mouse:up', () => {
    isDrawing = false;
    const data = {
        type: 'stop',
    };
    socket.emit('draw', data); // Send drawing data to the server
});

// Listen for drawing data from the server
socket.on('draw', (data) => {
    const pointer = new fabric.Point(data.x, data.y);

    switch (data.type) {
        case 'start':
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.onMouseDown(pointer);
            break;
        case 'draw':
            canvas.freeDrawingBrush.onMouseMove(pointer);
            break;
        case 'stop':
            canvas.freeDrawingBrush.onMouseUp();
            break;
    }
});