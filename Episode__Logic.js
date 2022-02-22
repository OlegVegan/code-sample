export const defaultEpisodeLogic = {

    /* LAUNCH */
    playing: false, // Играет ли сейчас
    loading: false, // Загружается ли из localStorage




    /* DATA */
    id: null,
    data: null,




    /* BASIC */
    overallLines: null, // Сумма всех строк
    over: false, // Закончился ли полностью эпизод fixme: last line exception
    mode: 1, // Режим игры - за кого игра
    // Сколько моих строк, (сколько надо сказать строк в зависимости от режима, нужно чтоб узнать когда закончились мои строки для сохранения)
    myLines: function () {
        if (this.mode === 1) return this.data.lines_left
        if (this.mode === 2) return this.data.lines_right
        if (this.mode === 3) return this.data.lines_left + this.data.lines_right
    },
    // Закончились ли мои строки, чтобы зачислить материл пройденным
    myLinesOver: function () {
        if (this.myLines() === this.myLinesPassed) return true
        return false
    },
    timesPassed: 0, // Сколько раз пройден материал
    failsRecord: 99999, // Сколько раз пройден материал. Если нет записи, ставим большой
    failsToSkip: 2, // Сколько раз надо ошибиться, чтоб можно было пропустить строку




    /* LINES */
    // Активная строка. Устанавливается по запуску, смена тригерит запуск звука
    currentLine: null,
    // Порядок четырёхзначный активной строки, название файла для звука строки
    currentLineOrder: function () {
        if (this.data.length === 0 || this.currentLine === null) return null
        if (!this.data.script) return null
        return this.data.script[this.currentLine].order
    },
    // Тип активной строки
    currentType: function () {
        if (this.data.length === 0 || this.currentLine === null) return null
        return this.data.script[this.currentLine].type
    },
    // Текст активной строки
    currentText: function () {
        if (!this.data || !this.currentType()) return null

        // Подготавливаем текст активной строки для сравнения с микро
        // Нужно только для левой/правой строки

        if (this.currentType() !== 'center') {
            let dummyText = []
            this.data.script[this.currentLine].text.forEach((word) => {
                // Очистка слова от разных знаков
                dummyText.push(word.word.replace(/[.,:;!?"]/g, "").toLowerCase())
            })

            return dummyText
        }
    },
    // Моя ли строка сейчас активна, (зависит от режима игры и типа активной строки)
    currentLineIsMine: function () {
        if (this.currentType() === null) return null
        if ((this.mode === 1 && this.currentType() === 'left') ||
            (this.mode === 2 && this.currentType() === 'right') ||
            (this.mode === 3 && this.currentType() === 'left') ||
            (this.mode === 3 && this.currentType() === 'right')) {
            return true
        } else {
            return false
        }
    },
    myLinesPassed: 0, // Сколько я сказал/пропустил своих строк
    // Какую строку подсвечивать
    highlightedLine: function () {

        // Если что-то играет, подсвечиваем её
        if (this.currentlyPlaying) {
            for (let i = 0; i < this.data.script.length; i++) {
                if (this.data.script[i].order === this.currentlyPlaying) {
                    return i
                }
            }
        }
        // Иначе всегда подсвечиваем активную
        return this.currentLine
    },




    /* VOX */
    failsCurrent: 0, // Сколько фейлов произношения у активной строки
    failsOverall: 0, // Сколько фейлов произношения за весь материал
    userText: "", // Текст, который сказал юзер в последний раз
    /*  */
    wordMap: [], // Карта совпадений слов активной строки [true, true, false]
    // Сколько слов совпало подряд у активной строки
    matchesInARow: function () {
        if (this.wordMap.length !== 0) {
            var counter = 0
            for (let i = 0; i < this.wordMap.length; i++) {
                if (this.wordMap[i]) {
                    counter++
                } else {
                    return counter
                }
            }
        }

        return 0
    },
    // Индекс последнего совпавшего слова в карте, чтобы подсветить несовпавшие слова до него красным
    lastMatchIndex: function () {
        if (this.wordMap.length !== 0) {
            return this.wordMap.lastIndexOf(true)
        } else {
            return null
        }
    },




    /* SOUND */
    currentlyPlaying: null, // Какой файл играет в данный момент (Четырёхзначный порядок строки)
    autoSound: true, // Автоматом ли играет звук
    userSound: false, // Запустил ли юзер звук  




    /* CONTROLS */
    showTranslation: true, // Показывать перевод
    // Можно ли нажимать на микрофон
    micAvailable: function () {
        // Нельзя, если не загрузился материал
        if (this.currentLine === null) return false
        // Нельзя, если играет звук по сюжету
        if (this.autoSound) return false
        // Нельзя, если закончились строки юзера
        if (this.myLines() === this.myLinesPassed) return false
        return true
    },
    micOn: false, // Идёт запись на микрофон
    showLineControls: false, // Показывать ли кнопки управления отображением строк (только десктоп)
    showAllLines: false, // Показать все строки или только ограниченное экраном (только десктоп) 
    // Можно ли пропускать строку
    canSkipLines: function () {
        // Если хочет админ и не конец
        if (this.letMeSkip && !this.over) return true
        // Если не конец
        if (!this.over) {
            // Если она моя
            if (this.currentLineIsMine()) {
                // Если я ошибся достаточное количество раз
                if (this.failsCurrent >= this.failsToSkip) {
                    return true
                }
            }
        }

        return false
    },




    /* USER MESSAGE */
    msg: "", // Сообщение для юзера
    msgIncompleteTimes: 0, // Сколько раз юзер видел сообщение "Договорите строку"
    msgLimitIncomplete: 3, // Максимально сколько показывать "Договорите строку"




    /* ADMIN */
    letMeSkip: false, // Даёт пропускать админу без условий
    letMeSee: false, // Открывает весь сценарий
}