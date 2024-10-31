const socket = io(); // Connect to the socket server

// Room ID
let roomId;

// Join Room Button
document.getElementById("joinRoom").addEventListener("click", () => {
    roomId = document.getElementById("roomId").value;
    socket.emit('joinRoom', roomId);
});

const canvas = document.getElementById("artboard");
const ctx = canvas.getContext("2d");
let drawing = false;
let isEraser = false;
let brushColor = "#000000"; // Store the current brush color
const backgroundColor = "#FFFFFF"; // Canvas background color

// Set initial properties
ctx.lineWidth = 5;
ctx.lineCap = "round";
ctx.strokeStyle = brushColor;

// Fill the canvas with the background color
ctx.fillStyle = backgroundColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Arrays to hold the canvas states for undo and redo
let undoStack = [];
let redoStack = [];

// Start Drawing
canvas.addEventListener("mousedown", () => {
    drawing = true;
    saveState(); // Save state before starting to draw
});
canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath(); // Start a new path after each stroke
});
canvas.addEventListener("mousemove", draw);

function draw(event) {
    if (!drawing) return;

    ctx.strokeStyle = isEraser ? backgroundColor : brushColor; // Set stroke color based on eraser or brush mode

    const pos = { x: event.clientX - canvas.offsetLeft, y: event.clientY - canvas.offsetTop };
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    // Emit drawing data to the server
    socket.emit("drawing", pos, roomId);
}

// Listen for drawing events from other clients
socket.on("drawing", (data) => {
    ctx.strokeStyle = isEraser ? backgroundColor : brushColor; // Ensure correct color
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
});

// Function to save the current state of the canvas
function saveState() {
    // Push the current canvas image to the undo stack
    undoStack.push(canvas.toDataURL());
    // Clear the redo stack
    redoStack = [];
}

// Color Picker
document.getElementById("colorPicker").addEventListener("input", (event) => {
    brushColor = event.target.value;
    ctx.strokeStyle = brushColor;
    isEraser = false; // Disable eraser when color is changed
});

// Brush Size
document.getElementById("brushSize").addEventListener("input", (event) => {
    ctx.lineWidth = event.target.value;
});

// Brush Tool Button
document.getElementById("brushTool").addEventListener("click", () => {
    isEraser = false;
    ctx.strokeStyle = brushColor; // Set brush color back to selected color
});

// Eraser Tool Button
document.getElementById("eraserTool").addEventListener("click", () => {
    isEraser = true;
    ctx.strokeStyle = backgroundColor; // Set eraser color to match canvas background
});

// Clear Canvas
document.getElementById("clearCanvas").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Reset canvas with background color
    saveState(); // Save the cleared state
});

// Save Image
document.getElementById("saveImage").addEventListener("click", () => {
    // Create a new canvas to draw the current state with the background color
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    // Fill the temporary canvas with the background color
    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    // Draw the current canvas content onto the temporary canvas
    tempCtx.drawImage(canvas, 0, 0);

    // Create a link to download the image
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = tempCanvas.toDataURL(); // Get the data URL of the temporary canvas
    link.click();
});

// Undo Function
document.getElementById("undo").addEventListener("click", () => {
    if (undoStack.length > 0) {
        // Push the current state to redo stack before undoing
        redoStack.push(undoStack.pop());
        restoreState();
    }
});

// Redo Function
document.getElementById("redo").addEventListener("click", () => {
    if (redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        restoreState();
    }
});

// Function to restore the last saved state
function restoreState() {
    const lastState = undoStack[undoStack.length - 1]; // Get the last state
    const img = new Image();
    img.src = lastState; // Set image source to the last state
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        ctx.fillStyle = backgroundColor; // Fill with background color
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas
        ctx.drawImage(img, 0, 0); // Draw the last state
    };
}
