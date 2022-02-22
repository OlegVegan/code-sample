// React
import { useState, useEffect } from "react"

// Firebase
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage"

// Components
import BlockOrder from "./CourseEditor__Block__Order"
import DeleteBtn from "./CourseEditor__Block__Delete"
import FileUploader from "./CourseEditor__Block__FileUploader"
////
import Pic from "./CourseEditor__Block__Pic"
import Formula from "./CourseEditor__Block__Formula.js"
////
import TextWithNotes from "../../../common/editor/TextWithNotes"
import Task from "./CourseEditor__Block__Task"

export default function CourseEditorBlock({ blockData, blockIndex, data, setData, logic, setLogic }) {
    const storage = getStorage()

    const blockOrder = blockData.order
    const formula = blockData.formula

    // Подсветка страниц по очереди для читабельности
    const [blockClasses, setBlockClasses] = useState('course-block-editor')
    useEffect(() => {
        if (blockIndex % 2 === 0) return setBlockClasses("course-block-editor")
        return setBlockClasses("course-block-editor block-odd")
    }, [blockData])

    // Проверка на наличие задания, чтобы оформить кнопку
    const [hasTask, setHasTask] = useState()
    useEffect(() => {
        if (data.script && data.script[blockIndex]) {
            if (data.script[blockIndex].task.length > 0) return setHasTask(true)
            return setHasTask(false)
        }
    }, [data])

    // Ссылка на звук
    const [audioLink, setAudioLink] = useState(false)
    useEffect(() => {
        listAll(ref(storage, 'courses/' + logic.id + '/audio/'))
            .then((res) => {
                // Ищем звук в списке файлов, если есть, берём ссылку
                res.items.forEach((itemRef) => {
                    if (itemRef.name === blockOrder + ".mp3") {
                        getDownloadURL(ref(storage, 'courses/' + logic.id + '/audio/' + blockOrder + ".mp3")).then((url) => {
                            setAudioLink(url)
                        })
                    }
                })
            }).catch((error) => {
                console.error(error)
            })
    }, [logic.audioTrigger])

    // Текст, который возвращается с общей радакторской при изменениях для сохранения
    const [text, setText] = useState(null)
    useEffect(() => {
        if (text) {
            // Сохранение
            var new_script = [...data.script]
            new_script[blockIndex].text = text
            setData(p => ({ ...p, script: new_script }))
        }
    }, [text])

    return (
        <>
            <div className={blockClasses}>
                <div className="course-block-editor-header">
                    <BlockOrder blockOrder={blockOrder} logic={logic} setLogic={setLogic} data={data} setData={setData} />
                    <DeleteBtn blockOrder={blockOrder} data={data} setData={setData} />
                    <FileUploader audioLink={audioLink} blockOrder={blockOrder} logic={logic} setLogic={setLogic} />
                </div>
                <Pic audioLink={audioLink} blockOrder={blockOrder} logic={logic} setLogic={setLogic} />
                <Formula formula={formula} blockOrder={blockOrder} data={data} setData={setData} />
                <TextWithNotes text={blockData.text} setText={setText} />
                <Task hasTask={hasTask} blockOrder={blockOrder} task={blockData.task} data={data} setData={setData} />
            </div>
        </>
    )
}