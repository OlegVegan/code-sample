// React
import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"

// Helpers
import { humanDate, linesDeclension } from "../../common/Helpers"
import { SavedTag, CompletedTag, CompletedPerfectlyTag, SubsOnlyTag } from "../../common/Icons"

// Context
import { GlobalContext } from "../../../GlobalContext"

// Components
import ProgressBar from "../../common/ProgressBar"

// Style
import "./EpisodeList__Item.scss"

export default function EpisodesListItem({ epData, epIndex, filter }) {
    const user = useContext(GlobalContext).userData
    const epCovers = useContext(GlobalContext).epCovers
    const navigate = useNavigate()
    const id = epData.id

    // Обложка
    const [picStyle] = useState(() => {
        for (let i = 0; i < epCovers.length; i++) {
            if (epCovers[i].id === id) {
                return {
                    backgroundSize: 'cover',
                    backgroundImage: 'url(' + epCovers[i].cover + ')',
                }
            }
        }
    })

    // История прохождения
    const [saved, setSaved] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [completedPerfectly, setCompletedPerfectly] = useState(false)
    const [currentLine, setCurrentLine] = useState(null)
    const [overallLines] = useState(() => {
        return epData.lines_left + epData.lines_right + epData.lines_center - 1
    })
    const [lines] = useState(() => {
        return epData.lines_left + epData.lines_right
    })

    useEffect(() => {
        if (localStorage.getItem('ep_history')) {
            var ep_history = JSON.parse(localStorage.getItem('ep_history'))

            if (!ep_history[id]) {

                setSaved(false)
                setCompleted(false)
                setCompletedPerfectly(false)

            } else {

                if (ep_history[id].saved) {
                    setSaved(true)
                    setCurrentLine(ep_history[id].currentLine)
                }

                if ((ep_history[id].timesPassed > 0) && (ep_history[id].failsRecord > 0)) {
                    setCompleted(true)
                }

                if ((ep_history[id].timesPassed > 0) && (ep_history[id].failsRecord === 0)) {
                    setCompletedPerfectly(true)
                }
            }
        }
    }, [])

    // Фильтр
    if (lines > filter.max || lines < filter.min) return ""

    // Имена участников в зависимости от типа
    function epListNames(type) {
        if (Number(type) === 2) return epData.left + ", " + epData.right
        return epData.left
    }

    // Иконка у имён в зависимости от типа
    function peopleIcon(type) {
        if (Number(type) === 2) return "people"
        return "person"
    }

    return (
        <>
            <div onClick={() => navigate(`/episode/${epData.slug}`)} className="episodes-item ctt" data-date={epData.timePublished} >

                {/* Персонажи и иконки сохранения и прохождения */}
                <div className="episodes-item__container">
                    <span className="material-icons episodes-item__people__tag">{peopleIcon(epData.type)}</span>
                    <div className="episodes-item__people">
                        {epListNames(epData.type)}
                    </div>
                </div>

                {/* Картинка и информация */}
                <div className={completed || completedPerfectly ? "episodes-item__container2 gray-100" : "episodes-item__container2"} style={picStyle}>
                    <div className="episodes-item__desc">{linesDeclension(lines)}</div>
                    {/* Дата публикации для админа */}
                    {user.role === 'admin' ? <div style={{ padding: "10px", color: "white", fontSize: "30px", float: "right", textShadow: "#000 2px 2px 2px" }}>{humanDate(epData.timePublished.toDate(), false, true)}</div> : ""}
                </div>

                {/* Название и прогресс бар прохождения, если есть сохранение */}
                <div className="episodes-item__container3">
                    {saved ? <div className="episodes-item__progress"><ProgressBar bar={currentLine} bars={overallLines} /></div> : ""}
                    <div>
                        {saved ? <SavedTag /> : ""}
                        {completed ? <CompletedTag /> : ""}
                        {completedPerfectly ? <CompletedPerfectlyTag /> : ""}
                        {(user.subbed || epData.free) ? "" : <SubsOnlyTag />}
                        <div className="episodes-item__name">{epData.name}</div>
                    </div>
                </div>
            </div>
        </>
    )
}