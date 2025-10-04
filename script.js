class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gameLoop = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateFood();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
                if (this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'ArrowDown':
                if (this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'ArrowLeft':
                if (this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'ArrowRight':
                if (this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.dx = 1;
        this.dy = 0;
        this.gameLoop = setInterval(() => this.update(), 150);
        this.startBtn.textContent = 'Joc în desfășurare...';
        this.startBtn.disabled = true;
    }
    
    pauseGame() {
        if (!this.gameRunning) return;
        
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        this.startBtn.textContent = 'Continuă';
        this.startBtn.disabled = false;
    }
    
    resetGame() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.generateFood();
        this.updateDisplay();
        this.draw();
        this.gameOverElement.style.display = 'none';
        this.startBtn.textContent = 'Start Joc';
        this.startBtn.disabled = false;
    }
    
    update() {
        this.clearCanvas();
        this.moveSnake();
        this.drawSnake();
        this.drawFood();
        
        if (this.checkCollision()) {
            this.gameOver();
        }
    }
    
    moveSnake() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            this.updateDisplay();
        } else {
            this.snake.pop();
        }
    }
    
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        // Verifică dacă mâncarea nu este pe șarpe
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood();
                break;
            }
        }
    }
    
    checkCollision() {
        const head = this.snake[0];
        
        // Verifică coliziunea cu pereții
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // Verifică coliziunea cu corpul șarpelui
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateDisplay();
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        this.startBtn.textContent = 'Start Joc';
        this.startBtn.disabled = false;
    }
    
    drawSnake() {
        this.ctx.fillStyle = '#4ecdc4';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
            
            // Adaugă un efect de gradient pentru cap
            if (i === 0) {
                this.ctx.fillStyle = '#ff6b6b';
                this.ctx.fillRect(segment.x * this.gridSize + 2, segment.y * this.gridSize + 2, this.gridSize - 6, this.gridSize - 6);
                this.ctx.fillStyle = '#4ecdc4';
            }
        }
    }
    
    drawFood() {
        this.ctx.fillStyle = '#ffd93d';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Adaugă un efect de strălucire
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2 - 3,
            this.food.y * this.gridSize + this.gridSize / 2 - 3,
            3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    draw() {
        this.clearCanvas();
        this.drawSnake();
        this.drawFood();
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }
}

// Inițializează jocul când se încarcă pagina
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
