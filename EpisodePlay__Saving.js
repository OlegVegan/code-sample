
// Сохранение прогресса в процессе прохождения, для возможности возобновления игры
export function autosave(id, logic) {

    var newSave = {
        saved: true,
        mode: logic.mode,
        currentLine: logic.currentLine,
        myLinesPassed: logic.myLinesPassed,
        fails: logic.failsOverall,
        failsRecord: logic.failsRecord,
        matchesInARow: logic.matchesInARow,
        timesPassed: logic.timesPassed
    }

    // Ищем в истории и сохраняем
    var dummyObj = {}
    dummyObj[id] = newSave

    if (localStorage.getItem('ep_history')) {

        // История есть, сохраняем
        var ep_history = JSON.parse(localStorage.getItem('ep_history'));

        ep_history[id] = newSave
        localStorage.setItem('ep_history', JSON.stringify(ep_history));

    } else {

        // История пустая, пишем первый сейв
        localStorage.setItem('ep_history', JSON.stringify(dummyObj));
    }
}

// Сохранение по факту прохождения для отметки 'пройдено' в списке материалов
export function saveCompletion(id, logic) {

    // Ищем в истории и сохраняем
    if (localStorage.getItem('ep_history')) {

        // История есть, ищем проходил ли уже
        var ep_history = JSON.parse(localStorage.getItem('ep_history'));
        if (ep_history[id]) {

            // Есть запись, проверяем обновлён ли рекорд фейлов
            if (logic.failsOverall < logic.failsRecord) {

                // Новый рекорд, +1 к прохождению
                ep_history[id] = { saved: false, failsRecord: logic.failsOverall, timesPassed: (logic.timesPassed + 1) }
                localStorage.setItem('ep_history', JSON.stringify(ep_history));

            } else {

                // Рекорда нет, просто +1 к прохождению
                ep_history[id] = { saved: false, failsRecord: logic.failsRecord, timesPassed: (logic.timesPassed + 1) }
                localStorage.setItem('ep_history', JSON.stringify(ep_history));

            }

        } else {

            // Сохраняем впервые
            var dummyObj = {}
            dummyObj[id] = { saved: false, failsOverall: logic.failsOverall, timesPassed: 1 }
            localStorage.setItem('ep_history', JSON.stringify(dummyObj));
        }

    } else {

        // История пустая, пишем первый сейв
        // Мали ли, очистил историю пока проходил

        var dummyObj2 = {}
        dummyObj2[id] = { saved: false, failsOverall: logic.failsOverall, timesPassed: 1 }
        localStorage.setItem('ep_history', JSON.stringify(dummyObj2));
    }
}