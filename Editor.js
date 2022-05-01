// React
import { useContext, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"

// Firebase
import { db } from "../../../../Firebase"
import { getDoc, doc } from 'firebase/firestore'

// Context
import { GlobalContext } from "../../../../GlobalContext"

// Components
import AdminPanel from "./AdminPanel"
////
import SaveBtn from "./SaveBtn"
import MaterialNameDesc from "../../../common/editor/MaterialNameDesc.js"
import PicBlock from "./PicBlock"
import Stats from "./Stats"
////
import Block from "./Block"
import Add from "./NewBlock"
////
import { defaultLogic } from "../../../common/editor/Logic"

// Helpers
import { LoadingTag } from "../../../common/Icons"

// Style
import "../../../../components/common/editor/Editor.scss"
import "./Editor.scss"

export default function CourseEditor() {
    let navigate = useNavigate()
    const user = useContext(GlobalContext).userData
    const setSiteData = useContext(GlobalContext).setSiteData
    const { id } = useParams()

    // Логика и данные редакторской
    const [logic, setLogic] = useState(({ ...defaultLogic, page: "courses" }))

    // Первичное считывание данных материала
    useEffect(() => {
        setSiteData(p => ({ ...p, crumbs: 'course_editor' }))

        // Проверка на существование материала
        getDoc(doc(db, "courses", id)).then((entry) => {
            if (entry.exists()) {
                if (entry.data().belongsTo === user.id || user.role === 'admin') {
                    setLogic(p => ({ ...p, showEditor: true, data: entry.data(), id: id }))
                }
            }
        })
    }, [user.role])

    if (!logic.showEditor || !logic.data) return <div id="editor-c"><LoadingTag /></div>
    return (
        <div id="editor-c">
            <AdminPanel logic={logic} setLogic={setLogic} />

            <input type="button" value="Запустить" onClick={() => navigate('/course/' + logic.data.slug)} />
            <SaveBtn logic={logic} setLogic={setLogic} />
            <MaterialNameDesc logic={logic} setLogic={setLogic} />

            <PicBlock logic={logic} setLogic={setLogic} />
            <Stats logic={logic} />

            <Blocks logic={logic} setLogic={setLogic} />

            <Add logic={logic} setLogic={setLogic} />
        </div>
    )
}

function Blocks({ logic, setLogic }) {
    if (logic.data.script.length === 0) return ""
    return (
        <div className="editor-material-list">
            {logic.data.script.sort((a, b) => a.order.toString() - b.order.toString()).map((data, index) => {
                return <Block key={data.order} data={data} index={index} logic={logic} setLogic={setLogic} />
            })}
        </div>
    )
}