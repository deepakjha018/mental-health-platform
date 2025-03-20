class ArtTherapy {
    constructor() {
        // Initialize canvas and context
        this.canvas = document.getElementById('artCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        
        // Initialize drawing state
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Initialize tools and settings
        this.currentTool = 'brush';
        this.currentColor = '#4ECDC4';
        this.brushSize = 5;
        
        // Initialize undo history
        this.undoStack = [];
        
        // Initialize activities
        this.activities = {
            'emotion-wheel': {
                setup: () => {
                    this.clear();
                    this.ctx.beginPath();
                    this.ctx.arc(this.canvas.width/2, this.canvas.height/2, 200, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.showInstructions('emotionWheelInstructions');
                }
            },
            'mindful-mandala': {
                setup: () => {
                    this.clear();
                    // Draw mandala guidelines
                    for(let i = 0; i < 8; i++) {
                        this.ctx.save();
                        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
                        this.ctx.rotate(i * Math.PI/4);
                        this.ctx.beginPath();
                        this.ctx.moveTo(0, -200);
                        this.ctx.lineTo(0, 200);
                        this.ctx.stroke();
                        this.ctx.restore();
                    }
                    this.showInstructions('mandalaInstructions');
                }
            },
            'stress-scribbles': {
                setup: () => {
                    this.clear();
                    this.brushSize = 10;
                    this.ctx.lineWidth = this.brushSize;
                    document.getElementById('brushSize').value = this.brushSize;
                    this.showInstructions('scribblesInstructions');
                }
            },
            'dream-board': {
                setup: () => {
                    this.clear();
                    // Draw vision board grid
                    this.ctx.strokeStyle = '#eee';
                    this.ctx.lineWidth = 1;
                    for(let i = 0; i < 3; i++) {
                        for(let j = 0; j < 3; j++) {
                            this.ctx.strokeRect(
                                i * this.canvas.width/3,
                                j * this.canvas.height/3,
                                this.canvas.width/3,
                                this.canvas.height/3
                            );
                        }
                    }
                    this.ctx.strokeStyle = this.currentColor;
                    this.ctx.lineWidth = this.brushSize;
                    this.showInstructions('dreamBoardInstructions');
                }
            }
        };
        
        // Bind event handlers
        this.bindEvents();
        
        // Save initial state
        this.saveState();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = 500;
        
        // Reset context properties after resize
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.brushSize;
    }

    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseout', this.handleMouseUp.bind(this));

        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
        });

        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('input', (e) => this.setColor(e.target.value));

        // Color presets
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = window.getComputedStyle(btn).backgroundColor;
                this.setColor(color);
            });
        });

        // Brush size slider
        const brushSlider = document.getElementById('brushSize');
        brushSlider.addEventListener('input', (e) => this.setBrushSize(e.target.value));

        // Action buttons
        document.getElementById('clearCanvas').addEventListener('click', () => this.clear());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('saveArtwork').addEventListener('click', () => this.save());

        // Templates
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => this.loadTemplate(card.dataset.template));
        });

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());

        // Add activity button handlers
        document.querySelectorAll('.activity-card').forEach(card => {
            card.addEventListener('click', () => {
                const activity = card.dataset.activity;
                if (this.activities[activity]) {
                    this.activities[activity].setup();
                    
                    // Highlight selected activity
                    document.querySelectorAll('.activity-card').forEach(c => 
                        c.style.transform = c === card ? 'translateY(-10px)' : 'translateY(0)');
                }
            });
        });
    }

    handleMouseDown(e) {
        e.preventDefault();
        this.isDrawing = true;
        [this.lastX, this.lastY] = this.getPointerPosition(e);
    }

    handleMouseMove(e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        this.draw(e);
    }

    handleMouseUp(e) {
        e.preventDefault();
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            this.isDrawing = true;
            [this.lastX, this.lastY] = this.getPointerPosition(e.touches[0]);
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        this.draw(e.touches[0]);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }

    getPointerPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return [
            e.clientX - rect.left,
            e.clientY - rect.top
        ];
    }

    draw(e) {
        const [x, y] = this.getPointerPosition(e);

        switch (this.currentTool) {
            case 'brush':
                this.ctx.globalCompositeOperation = 'source-over';
                this.drawStroke(x, y);
                break;
            case 'eraser':
                this.ctx.globalCompositeOperation = 'destination-out';
                this.drawStroke(x, y);
                break;
            case 'spray':
                this.drawSpray(x, y);
                break;
        }

        [this.lastX, this.lastY] = [x, y];
    }

    drawStroke(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    drawSpray(x, y) {
        const density = 30;
        const radius = this.brushSize * 2;

        this.ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;
            const xOffset = x + Math.cos(angle) * r;
            const yOffset = y + Math.sin(angle) * r;

            this.ctx.beginPath();
            this.ctx.arc(xOffset, yOffset, 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = this.currentColor;
            this.ctx.fill();
        }
    }

    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
    }

    setColor(color) {
        this.currentColor = color;
        this.ctx.strokeStyle = color;
    }

    setBrushSize(size) {
        this.brushSize = parseInt(size);
        this.ctx.lineWidth = this.brushSize;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }

    undo() {
        if (this.undoStack.length > 1) {
            this.undoStack.pop(); // Remove current state
            const previousState = this.undoStack[this.undoStack.length - 1];
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = previousState;
        }
    }

    saveState() {
        this.undoStack.push(this.canvas.toDataURL());
        if (this.undoStack.length > 20) this.undoStack.shift();
    }

    save() {
        const link = document.createElement('a');
        link.download = 'artwork.png';
        link.href = this.canvas.toDataURL();
        link.click();
        this.showMessage('Artwork saved successfully!');
    }

    showMessage(text) {
        const message = document.createElement('div');
        message.className = 'message';
        message.textContent = text;
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }

    loadTemplate(templateName) {
        const svg = document.querySelector(`.template-card[data-template="${templateName}"] svg`);
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
            this.clear();
            const scale = Math.min(
                this.canvas.width / img.width,
                this.canvas.height / img.height
            );
            const x = (this.canvas.width - img.width * scale) / 2;
            const y = (this.canvas.height - img.height * scale) / 2;
            this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            this.saveState();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }

    showInstructions(instructionsId) {
        // Hide all instructions
        document.querySelectorAll('.activity-instructions').forEach(inst => 
            inst.classList.remove('active'));
        
        // Show selected instructions
        const instructions = document.getElementById(instructionsId);
        if (instructions) {
            instructions.classList.add('active');
            instructions.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArtTherapy();
}); 