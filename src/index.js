// Базовый класс предок для всех сущностей на поле
class Entity {
  constructor(type, cell) {
    this.type = type; // Тип сущности
    this.cell = cell; // Ссылка на ячейку, в которой находится сущность
    this.field = cell.getParentField(); // Получение ссылки на поле через ячейку
  }

  // Методы доступа к свойствам сущности
  getCell() {
    return this.cell; // Получение ячейки, в которой находится сущность
  }

  getType() {
    return this.type; // Получение типа сущности
  }
}

// Класс для пустой ячейки
class EmptyCell extends Entity {
  constructor(cell) {
    super('empty', cell); // Вызов конструктора базового класса с типом 'empty'
  }
}

// Класс для игрока
class Player extends Entity {
  constructor(cell) {
    super('player', cell); // Вызов конструктора базового класса с типом 'player'
    this.eatenMeal = 0; // Количество съеденных единиц еды
    this.direction = 'left'; // Направление движения игрока
    this.interval = null; // Интервал для автоматического движения игрока
  }

  // Методы для перемещения игрока в разные направления
  move(dx, dy) {
    const [x, y] = this.field.getPlayerPos(); // Получение текущих координат игрока
    const nextCell = this.field.getCell(x + dx, y + dy); // Получение следующей ячейки для перемещения

    const canThrough = ['empty', 'meal', 'enemy']; // Список типов ячеек, через которые можно пройти
  
    // Проверка наличия препятствия в следующей ячейке
    if (!nextCell || !canThrough.includes(nextCell.getContent().getType())) {
      console.log(`Препятствие! Player остановился.`);
      return;
    }

    // Обработка съеденной еды
    if (nextCell.getContent().getType() === 'meal') {
      this.eatenMeal += 1;
    }

    // Проверка условия поражения
    if (nextCell.getContent().getType() === 'enemy') {
      this.field.defeat();
      return;
    }

    // Проверка условия победы
    if (this.eatenMeal === this.field.getCountMeal()) {
      this.field.win();
      return;
    }
  
    // Обновление содержимого текущей и следующей ячеек после перемещения
    this.cell.setContent(new EmptyCell(this.cell));
    nextCell.setContent(this);
    // Обновление позиции игрока на поле
    this.field.setPlayerPos(x + dx, y + dy);
    this.cell = nextCell;
  }

  left() {
    this.move(0, -1); // Движение влево
  }

  right() {
    this.move(0, 1); // Движение вправо
  }

  up() {
    this.move(-1, 0); // Движение вверх
  }

  down() {
    this.move(1, 0); // Движение вниз
  }

  // Метод для выполнения шага (движения в текущем направлении)
  step() {
    this[this.direction]();
  }

  // Метод для включения/выключения автоматического движения игрока
  toggleInterval() {
    if (this.interval !== null) {
      clearInterval(this.interval); // Остановка интервала
      this.interval = null;
    } else {
      // Запуск интервала для автоматического выполнения шагов игрока
      this.interval = setInterval(() => {
        this.step();
      }, 800);
    }
  }
}

// Класс для стены
class Wall extends Entity {
  constructor(cell) {
    super('wall', cell); // Вызов конструктора базового класса с типом 'wall'
  }
}

// Класс для еды
class Meal extends Entity {
  constructor(cell) {
    super('meal', cell); // Вызов конструктора базового класса с типом 'meal'
  }
}

// Класс для врага
class Enemy extends Entity {
  constructor(cell) {
    super('enemy', cell); // Вызов конструктора базового класса с типом 'enemy'
  }
}

// Словарь типов содержимого ячеек
const cellContentMap = {
  'empty': EmptyCell,
  'player': Player,
  'wall': Wall,
  'meal': Meal,
  'enemy': Enemy,
};

// Класс для ячейки поля
class Cell {
  constructor(type, field) {
    const EntityClass = cellContentMap[type]; // Получение соответствующего класса сущности по типу
    if (!EntityClass) {
      throw new Error('Тип ячейки не найден!');
    }

    this.field = field; // Ссылка на поле
    this.content = new EntityClass(this); // Создание экземпляра сущности в ячейке
  }

  // Методы для работы с содержимым ячейки
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

// Класс для игрового поля
class Field {
  constructor(x = 2, y = 2, startX = 0, startY = 0) {
    this.maps = {}; // Коллекция карт
    this.player = [startX, startY]; // Позиция игрока на поле
    this.interval = null; // Интервал для обновления вывода поля
    this.status = false; // Статус игры (запущена/остановлена)
  }

  // Методы для работы с полем и картами

  // Получение текущего состояния игрового поля
  getField() {
    return this.field;
  }

  // Получение количества еды на карте
  getCountMeal() {
    return this.map.countMeal;
  }

  // Преобразование игрового поля в строку для отображения
  toString() {
    return this.getField().map(row => row.map(cell => `[${cell.getContent().getType()}]`).join('')).join('\n');
  }

  // Установка позиции игрока на поле
  setPlayerPos(x, y) {
    this.player = [x, y];
  }

  // Получение позиции игрока на поле
  getPlayerPos() {
    return this.player;
  }

  // Получение содержимого ячейки по ее координатам
  getCell(x, y) {
    if (!this.getField()[x] || !this.getField()[x][y]) {
      return null;
    }
    return this.getField()[x][y];
  }

  // Принудительная остановка игры
  breakGame() {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }

    const ply = this.getPlayerEnt();

    if (ply.interval !== null) {
      clearInterval(ply.interval);
      ply.interval = null;
    }
  }

  // Включение/выключение интервала для обновления вывода игрового поля
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

  // Изменение статуса игры (запущена/остановлена)
  toggleStatus() {
    this.status = !this.status;
  }

  // Получение экземпляра игрока на поле
  getPlayerEnt() {
    return this.getCell(...this.getPlayerPos()).getContent();
  }

  // Получение текущей выбранной карты
  getCurrentMap() {
    return this.currentMap;
  }

  // Запуск игры
  start() {
    if (!this.status) {
      if (Object.entries(this.maps).length === 0 || this.currentMap === null || !this.maps[this.currentMap]) {
        console.log('Карта не выбрана!');
        return;
      }

      this.map = this.maps[this.getCurrentMap()];
      this.field = this.map.field;

      const player = this.getPlayerEnt();
      player.toggleInterval();
      this.toggleInterval();
      this.toggleStatus();
    }
  }

  // Остановка игры
  stop() {
    if (this.status) {
      const player = this.getPlayerEnt();
      player.toggleInterval();
      this.toggleInterval();
      this.toggleStatus();
    }
  }

  // Объявление победы
  win() {
    this.stop();
    this.getPlayerEnt().eatenMeal = 0;
    console.clear();
    console.log('Поздравляю! Вы прошли уровень!')
  }

  defeat() {
    this.stop();
    this.getPlayerEnt().eatenMeal = 0;
    console.clear();
    console.log('Вы проиграли!');
  }

  // Получение направления движения игрока
  getPlayerDirection() {
    const player = this.getPlayerEnt();
    return player.direction;
  }

  // Установка направления движения игрока
  setPlayerDirection(newDir) {
    const player = this.getPlayerEnt();
    player.direction = newDir;
  }

  // Добавление новой карты на поле
  addMap(lvl, map) {
    if (map.length < 2 || map.some(line => line.length < 2)) {
      throw new Error('Минимальный размер карты 2x2!');
    }

    let countMeal = 0;
    let hasPlayer = false;

    const field = map.reduce((accLine, line, lineId) => [...accLine, line.reduce((accCell, cell, cellId) => {
      const type = cell[0];

      if (type === 'player') {
        if (!hasPlayer) {
          this.setPlayerPos(lineId, cellId);
          hasPlayer = true;
        } else {
          throw new Error('На карте не может быть больше одного игрока!');
        }
    }

      if (type === 'meal') {
        countMeal += 1;
      }

      return [...accCell, new Cell(type, this)]
    }, [])], [])

    if (countMeal === 0) {
      throw new Error('Карта не содержит еды!');
    }

    if (!hasPlayer) {
      throw new Error('Карта не содержит игрока!');
    }

    this.maps[lvl] = {
      countMeal,
      field,
    };
  }

  // Выбор карты для игры
  choiceMap(lvl) {
    if (this.maps[lvl]) {
      this.currentMap = lvl;
    }
  }
}

// Создание экземпляра игрового поля
const field = new Field(5, 5, 0, 0);

// Добавление карты на поле
field.addMap(1,
  [
    [['meal'], ['meal'], ['enemy'], ['meal'], ['meal']],
    [['meal'], ['wall'], ['wall'], ['wall'], ['meal']],
    [['meal'], ['wall'], ['empty'], ['wall'], ['meal']],
    [['meal'], ['wall'], ['empty'], ['wall'], ['meal']],
    [['meal'], ['meal'], ['meal'], ['meal'], ['player']],
  ]
)

// Обработчик событий для управления игрой через консольный ввод
process.stdin.setRawMode(true); // Включение режима сырых данных для обработки клавиш
process.stdin.resume(); // Возобновление чтения данных из stdin
process.stdin.setEncoding('utf8'); // Установка кодировки ввода данных

process.stdin.on('data', (key) => {
  if (key === '\u0003') {
    process.exit(); // Выход из программы при нажатии Ctrl+C
  } else {
    switch (key) {
      case 'w':
        field.setPlayerDirection('up'); // Установка направления движения вверх
        break;
      case 's':
        field.setPlayerDirection('down'); // Установка направления движения вниз
        break;
      case 'a':
        field.setPlayerDirection('left'); // Установка направления движения влево
        break;
      case 'd':
        field.setPlayerDirection('right'); // Установка направления движения вправо
        break;
      case ' ':
        if (!field.status) {
          field.choiceMap(1); // Выбор карты для начала игры
          field.start(); // Запуск игры
        } else {
          field.stop(); // Остановка игры
          process.stdin.pause(); // Приостановка чтения данных из stdin
        }
        break;
      case 'f':
        field.breakGame(); // Принудительная остановка игры
        process.stdin.pause(); // Приостановка чтения данных из stdin
        break;
      default:
        break;
    }
  }
});
