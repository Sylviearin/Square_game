// Класс игры, который принимает значение времени игры в секундах
class Game {

    constructor(gameTime) {
        this.gameTime = gameTime * 1000; // свойство которое хранит время игры
    }

    //метод для генерации задержки квадратов, используется асинхронно вместе с методом старта
    spawnDelay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    //основной метод для начала игры
    async start() {

        let timeToExit = (new Date).getTime() + this.gameTime; // время выхода из цикла и окончания игры
        let points = document.getElementById('points');
        let button = document.querySelector('button.manage-button');
        button.disabled = true; // отключение кнопки для защиты от мультиклика
        points.value = 0; // обнуление очков идёт уже после старта игры
        document.querySelector('input.form-control').value = ''; // очистка поля для вода имени

        while (true) {
            this.generateSquare();
            await this.spawnDelay(300); // задержка для генерации квадратов. Указывается в милисекундах

            if ((new Date).getTime() >= timeToExit) {


                let elements = document.getElementById('gameField').querySelectorAll('div');

                document.querySelector('div.modal-body > p > span').innerHTML = points.value;
                $('#saveResult').modal('show'); // вызов модального окна для сохранения результата

                for (let elem of elements) {
                    elem.remove(); // очистка игрового поля от оставшихся квадратов
                }

                button.disabled = false; // активация кнопки для старта новой игры
                return;
            }
        }

    }

    /* Метод для генерации квадратов. использует несколько вложенных функций для реализации своего функционала.
    getRandomPos - генерирует случайное число от 1 до 10 для задания позиции в grid контейнере.
    checkSamePos - функция для предотвращения генерации квадратов на уже занятых местах*/
    generateSquare() {

        let columnPos = getRandomPos();
        let rowPos = getRandomPos();
        let field = document.getElementById('gameField');
        let div = document.createElement('div');
        div.style.gridColumn = columnPos;
        div.style.gridRow = rowPos;
        div.onclick = removeSquare; // удаление квадрата по клику

        if (checkSamePos()) {
            (field).append(div);
        }

        //функция генерации случайного числа от 1 до 10
        function getRandomPos() {
            return Math.floor(Math.random() * (10 - 1 + 1)) + 1;
        }

        //функция для проверки ячейки. Проверяет сравнением стиля нового элемента со всеми другими в контейнере
        function checkSamePos() {

            for (let elem of field.children) {

                if (elem.matches(` div[style="grid-area: ${rowPos} / ${columnPos} / auto / auto;"]`)) {
                    return false;
                }
            }

            return true;
        }

        //функция которая реализовывает удаление квадрата и вызывает функцию для добавления очков
        function removeSquare() {
            this.remove();
            addPoint();
        }

        //после удаления квадрата добавляет одно очко
        function addPoint() {
            let points = document.getElementById('points');
            points.value = Number(points.value) + 1;
        }
    }

    //функция для обратного отсчета таймера
    startTimer() {

        let timer = this.gameTime / 1000, minutes, seconds;
        let display = document.getElementById('timeRemaining');
        let interval = setInterval(function () {

            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            if (!(--timer <= 0)) {
                display.value = minutes + ":" + seconds;
            } else {
                display.value = '00:00';
                clearInterval(interval);
            }
        }, 1000);
    }

    /* функция для сохранения результата по нажатию кнопки Save в модальном окне.
    Сохраняет до 10 лучших результатов и отображает их, если новый результат меньше всех 10 то он не сохранится */
    saveResult() {

        let userName = `${document.querySelector('input.form-control').value} score: `;
        let userScore = Number(document.getElementById('points').value);
        let scoreTable = document.querySelectorAll('ol > li');

        for (let elem of scoreTable) {
            if (Number(elem.querySelector('span').innerHTML) < userScore) {

                let newUserName = userName,
                    newUserScore = userScore;

                userName = elem.firstChild.nodeValue;
                userScore = Number(elem.querySelector('span').innerHTML);
                elem.innerHTML = `${newUserName}<span>${newUserScore}</span>`;
            }
        }

    }
}

let gameSquare = new Game(10); // создание игры по её классу. Обязательно передается время в секундах