const gridSize = 10;
const words = ['SUN', 'MOON', 'STAR', 'PLANET', 'GALAXY'];
let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
let firstSelection = null;
let secondSelection = null;
let foundWords = {};

function createCellElement(r, c) {
    const cellElement = document.createElement('div');
    cellElement.className = 'cell';
    cellElement.textContent = grid[r][c];
    cellElement.dataset.row = r;
    cellElement.dataset.col = c;
    cellElement.addEventListener('click', handleCellClick);
    return cellElement;
}

function placeWords(words) {
    words.forEach(word => {
        let placed = false;
        while (!placed) {
            const direction = Math.floor(Math.random() * 2); // 0: horizontal, 1: vertical
            const row = Math.floor(Math.random() * (gridSize - (direction === 1 ? word.length : 0)));
            const col = Math.floor(Math.random() * (gridSize - (direction === 0 ? word.length : 0)));

            let fits = true;
            for (let i = 0; i < word.length; i++) {
                const r = direction === 1 ? row + i : row;
                const c = direction === 0 ? col + i : col;
                if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
                    fits = false;
                    break;
                }
            }

            if (fits) {
                for (let i = 0; i < word.length; i++) {
                    const r = direction === 1 ? row + i : row;
                    const c = direction === 0 ? col + i : col;
                    grid[r][c] = word[i];
                }
                placed = true;
            }
        }
    });
}

function fillEmptyCells() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === '') {
                const randomLetter = letters[Math.floor(Math.random() * letters.length)];
                grid[r][c] = randomLetter;
            }
        }
    }
}

function renderGrid() {
    const gameElement = document.getElementById('game');
    gameElement.innerHTML = '';
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cellElement = createCellElement(r, c);
            gameElement.appendChild(cellElement);
        }
    }
}

function clearSelections() {
    firstSelection = null;
    secondSelection = null;
    const cells = document.querySelectorAll('.cell.selected');
    cells.forEach(cell => cell.classList.remove('selected'));
}

function highlightWord(startRow, startCol, endRow, endCol) {
    const direction = startRow === endRow ? 'horizontal' : 'vertical';
    const length = direction === 'horizontal' ? Math.abs(endCol - startCol) + 1 : Math.abs(endRow - startRow) + 1;
    const wordCells = [];

    for (let i = 0; i < length; i++) {
        const r = direction === 'horizontal' ? startRow : startRow + (startRow < endRow ? i : -i);
        const c = direction === 'horizontal' ? startCol + (startCol < endCol ? i : -i) : startCol;
        wordCells.push(document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`));
    }

    return wordCells;
}

function handleCellClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);

    if (!firstSelection) {
        firstSelection = { row, col };
        cell.classList.add('selected');
    } else if (!secondSelection) {
        secondSelection = { row, col };
        cell.classList.add('selected');
        checkWord();
    } else {
        clearSelections();
    }
}

function checkWord() {
    const { row: startRow, col: startCol } = firstSelection;
    const { row: endRow, col: endCol } = secondSelection;

    if (startRow !== endRow && startCol !== endCol) {
        flashWrong();
        return;
    }

    const wordCells = highlightWord(startRow, startCol, endRow, endCol);
    const selectedWord = wordCells.map(cell => cell.textContent).join('');

    if (words.includes(selectedWord) && !foundWords[selectedWord]) {
        wordCells.forEach(cell => {
            cell.classList.remove('selected');
            cell.classList.add('correct');
        });
        foundWords[selectedWord] = true;
        markWordAsFound(selectedWord);
        if (Object.keys(foundWords).length === words.length) {
            playWinningAnimation();
        }
    } else {
        flashWrong();
    }

    clearSelections();
}

function flashWrong() {
    const selectedCells = document.querySelectorAll('.cell.selected');
    selectedCells.forEach(cell => {
        cell.classList.add('wrong');
    });
    setTimeout(() => {
        selectedCells.forEach(cell => {
            cell.classList.remove('wrong', 'selected');
        });
        clearSelections();
    }, 500);
}

function markWordAsFound(word) {
    const wordElement = document.getElementById(`word-${word}`);
    wordElement.style.textDecoration = 'line-through';
}

function playWinningAnimation() {
    const cells = document.querySelectorAll('.cell');
    let delay = 0;

    cells.forEach(cell => {
        setTimeout(() => {
            cell.classList.add('disappearing');
            setTimeout(() => {
                cell.textContent = '';
                cell.classList.remove('correct', 'wrong', 'disappearing');
                cell.removeEventListener('click', handleCellClick);
            }, 500);
        }, delay);
        delay += Math.random() * 100;
    });

    setTimeout(() => {
        resetGame();
    }, 3000);
}

function resetGame() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    foundWords = {};
    words.forEach(word => {
        const wordElement = document.getElementById(`word-${word}`);
        wordElement.style.textDecoration = 'none';
    });
    placeWords(words);
    fillEmptyCells();
    renderGrid();
    bindCellClickHandlers();
}

function bindCellClickHandlers() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
}

function restartGame() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    foundWords = {};
    words.forEach(word => {
        const wordElement = document.getElementById(`word-${word}`);
        wordElement.style.textDecoration = 'none';
    });
    placeWords(words);
    fillEmptyCells();
    renderGrid();
    bindCellClickHandlers();
}

document.getElementById('restartButton').addEventListener('click', restartGame);

placeWords(words);
fillEmptyCells();
renderGrid();
bindCellClickHandlers();

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('mousemove', (e) => {
            const rect = cell.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            cell.style.transformOrigin = `${x}px ${y}px`;
        });
    });
});
