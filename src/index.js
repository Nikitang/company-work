class Entity {
  constructor(type, cell) {
    this.type = type;
    this.cell = cell;
    this.field = cell.getParentField();
  }

  getCell() {
    return this.cell;
  }

  getType() {
    return this.type;
  }
}

class EmptyCell extends Entity {
  constructor(cell) {
    super('empty', cell);
  }
}

class Player extends Entity {
  constructor(cell) {
    super('player', cell);
    this.direction = 'left';
    this.interval = null;
  }

  move(dx, dy) {
    const [x, y] = this.field.getPlayerPos();
    const nextCell = this.field.getCell(x + dx, y + dy);

    const canThrough = ['empty', 'meal'];
  
    if (!nextCell || !canThrough.includes(nextCell.getContent().getType())) {
      console.log(`Препятствие! Player остановился.`);
      return;
    }
  
    this.cell.setContent(new EmptyCell(this.cell));
    nextCell.setContent(this);
    this.field.setPlayerPos(x + dx, y + dy);
    this.cell = nextCell;
  }

  left() {
    this.move(0, -1);
  }

  right() {
    this.move(0, 1);
  }

  up() {
    this.move(-1, 0);
  }

  down() {
    this.move(1, 0);
  }

  step() {
    this[this.direction]();
  }

  toggleInterval() {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    } else {
      this.interval = setInterval(() => {
        this.step();
      }, 800);
    }
  }
}

class Wall extends Entity {
  constructor(cell) {
    super('wall', cell);
  }
}

class Meal extends Entity {
  constructor(cell) {
    super('meal', cell);
  }
}

class Enemy extends Entity {
  constructor(cell) {
    super('enemy', cell);
  }
}

const cellContentMap = {
  'empty': EmptyCell,
  'player': Player,
  'wall': Wall,
  'meal': Meal,
  'enemy': Enemy,
};

class Cell {
  constructor(type, field) {
    const EntityClass = cellContentMap[type];
    if (!EntityClass) {
      throw new Error('Тип ячейки не найден!');
    }

    this.field = field;
    this.content = new EntityClass(this);
  }

  setContent(newContent) {
    this.content = newContent;
  }

  getContent() {
    return this.content;
  }

  getParentField() {
    return this.field;
  }
}

class Field {
  constructor(x = 2, y = 2, startX = 0, startY = 0) {
    this.field = new Array(x);
    for (let i = 0; i < x; i += 1) {
      this.field[i] = new Array(y);
      for (let j = 0; j < y; j += 1) {
        this.field[i][j] = new Cell('empty', this);
      }
    }
    this.field[startX][startY] = new Cell('player', this);
    const maps = {};

    this.player = [startX, startY]; 
    this.interval = null;
    this.status = false;
  }

  toString() {
    return this.field.map(row => row.map(cell => `[${cell.getContent().getType()}]`).join('')).join('\n');
  }

  setPlayerPos(x, y) {
    this.player = [x, y];
  }

  getPlayerPos() {
    return this.player;
  }

  getCell(x, y) {
    if (!this.field[x] || !this.field[x][y]) {
      return null;
    }
    return this.field[x][y];
  }

  toggleInterval() {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    } else {
      this.interval = setInterval(() => {
        console.clear();
        console.log(this.toString());
      }, 400);
    }
  }

  toggleStatus() {
    this.status = !this.status;
  }

  getPlayerEnt() {
    return this.getCell(...this.getPlayerPos()).getContent();
  }

  start() {
    if (!this.status) {
      const player = this.getPlayerEnt();
      player.toggleInterval();
      this.toggleInterval();
      this.toggleStatus();
    }
  }

  stop() {
    if (this.status) {
      const player = this.getPlayerEnt();
      player.toggleInterval();
      this.toggleInterval();
      this.toggleStatus();
    }
  }

  getPlayerDirection() {
    const player = this.getPlayerEnt();
    return player.direction;
  }

  setPlayerDirection(newDir) {
    const player = this.getPlayerEnt();
    player.direction = newDir;
  }

  createMap(map, num) {
    const field = map.reduce((accLine, line, lineId) => [...accLine, line.reduce((accCell, cell, cellId) => {
      const type = cell[0];

      if (type === 'player') {
        this.setPlayerPos(lineId, cellId);
      }

      return [...accCell, new Cell(type, this)]
    }, [])], [])

    this.field = field;
  }
}

const field = new Field(5, 5, 0, 0);

field.createMap(
  [
    [['empty'], ['empty'], ['empty'], ['empty'], ['empty']],
    [['empty'], ['empty'], ['empty'], ['empty'], ['empty']],
    [['empty'], ['empty'], ['empty'], ['empty'], ['empty']],
    [['empty'], ['empty'], ['empty'], ['empty'], ['meal']],
    [['empty'], ['empty'], ['empty'], ['wall'], ['player']],
  ]
)

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (key) => {
  if (key === '\u0003') {
    process.exit();
  } else {
    switch (key) {
      case 'w':
        field.setPlayerDirection('up');
        break;
      case 's':
        field.setPlayerDirection('down');
        break;
      case 'a':
        field.setPlayerDirection('left');
        break;
      case 'd':
        field.setPlayerDirection('right');
        break;
      case ' ':
        if (!field.status) {
          field.start();
        } else {
          field.stop();
          process.stdin.pause();
        }
        break;
      default:
        break;
    }
  }
});
