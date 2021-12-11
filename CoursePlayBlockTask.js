// React
import { useState, useEffect } from "react"

// Варианты ответов на задание, если оно есть
export function Task({ currentBlockIndex, thisBlockIndex, task, taskMap, script, answerProgress, taskState, setTaskState }) {
    // Подсветка разная в зависимости от прохождения
    const [taskClasses, setTaskClasses] = useState()

    // Проверка состояния блока
    useEffect(() => {
        // Пропущенный блок
        if (taskMap[thisBlockIndex] === 'skipped') {
            setTaskState('skipped')
            return setTaskClasses("crs-block__content__task-container-disabled")
        }

        // Активный блок
        if (currentBlockIndex === thisBlockIndex) {
            setTaskState('active')
            return setTaskClasses("crs-block__content__task-container")
        }

        // Пройденный блок
        setTaskState('passed')
        return setTaskClasses("crs-block__content__task-container-disabled")
    }, [currentBlockIndex])

    return (
        <>
            <div className={taskClasses}>
                <div className="crs-block__content__task-container__header">
                    {taskState === 'skipped' ? "Вы пропустили это задание" : ""}
                    {taskState === 'active' ? "Что вы можете сказать:" : ""}
                    {taskState === 'passed' ? "Вы сказали:" : ""}
                </div>
                {taskState === 'skipped' ? "" : ""}
                {taskState === 'active' ? task.map((answer, answerIndex) => {
                    return (
                        <>
                            <div className="crs-block__content__task-container__task">
                                {answer.split(' ').map((word, wordIndex) => {
                                    // Подсветка слова в зависимости от прохождения сверяясь по карте прогресса ответов
                                    if ((answerProgress[answerIndex].wordsMatched - 1) >= wordIndex) return <div className="crs-block__content__task-container__task__word-highlighted">{word}</div>
                                    return <div className="crs-block__content__task-container__task__word">{word}</div>
                                })}
                            </div>
                        </>
                    )
                }) : ""}
                {taskState === 'passed' ? script[thisBlockIndex].task[taskMap[thisBlockIndex]] : ""}
            </div>
        </>
    );
}