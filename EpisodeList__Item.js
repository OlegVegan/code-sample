// React
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useContext } from "react"

// Firebase
import { getStorage, ref, getDownloadURL } from "firebase/storage"

// Helpers
import { humanDate, linesDeclension } from "../../common/Helpers"

// Context
import { GlobalContext } from "../../../GlobalContext"

// Components
import ProgressBar from "../../common/ProgressBar"

// Style
import "./EpisodeList__Item.scss"

export default function EpisodesListItem({ id, data, filter }) {
    const user = useContext(GlobalContext).userData
    const navigate = useNavigate()

    // Обложка
    const [picStyle, setPicStyle] = useState({})
    const storage = getStorage();
    useEffect(() => {
        getDownloadURL(ref(storage, 'episodes/' + id + '/' + id + '_cover.jpg')).then((url) => {
            if (url) {
                setPicStyle({
                    backgroundSize: 'cover',
                    backgroundImage: 'url(' + url + ')',
                })
            }
        })
    }, [])

    // История прохождения
    const [saved, setSaved] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [completedPerfectly, setCompletedPerfectly] = useState(false)
    const [currentLine, setCurrentLine] = useState(null)
    const [overallLines, setOverallLines] = useState(null)

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
                    setOverallLines(data.lines_left + data.lines_right + data.lines_center)
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
    if (data.lines > filter.max || data.lines < filter.min) return ""

    // Имена участников в зависимости от типа
    function epListNames(type) {
        if (Number(type) === 2) return data.left + ", " + data.right
        return data.left
    }

    return (
        <>
            <div onClick={() => navigate(`/episode/${data.slug}`)} className="episodes-item ctt" data-date={data.timePublished} >

                {/* Персонажи и иконки сохранения и прохождения */}
                <div className="episodes-item__container2">
                    <div className="episodes-item__icons">
                        {saved ? <SavedTag /> : ""}
                        {completed ? <CompletedTag /> : ""}
                        {completedPerfectly ? <CompletedPerfectlyTag /> : ""}
                        {(user.sub || data.free) ? "" : <SubsOnlyTag />}
                        <span className="material-icons episodes-item__people__tag">people</span>
                    </div>
                    <div className="episodes-item__people">
                        {epListNames(data.type)}
                    </div>
                </div>

                {/* Картинка и информация */}
                <div className="episodes-item__container" style={picStyle}>

                    <div className="episodes-item__desc">
                        {linesDeclension(data.lines)}
                        {/*  {linesDeclension(data.lines)}, {data.duration} мин. */}
                    </div>

                    {/* Дата публикации для админа */}
                    {user.role === 'admin' ? <div style={{ padding: "10px", color: "white", fontSize: "30px", float: "right", textShadow: "#000 2px 2px 2px" }}>{humanDate(data.timePublished.toDate(), false, true)}</div> : ""}
                    <div>{saved ? <ProgressBar bar={currentLine} bars={overallLines} /> : ""}</div>
                </div>

                {/* Название и прогресс бар прохождения, если есть сохранение */}
                <div className="episodes-item__container3">
                    {saved ? <div className="episodes-item__progress"><ProgressBar bar={currentLine} bars={overallLines} /></div> : ""}
                    <div className="episodes-item__name">{data.name}</div>
                </div>
            </div>
        </>
    );
}

function SavedTag() { return <span className="episodes-item__icons__tag material-icons">save</span> }

function CompletedTag() { return <span className="episodes-item__icons__tag material-icons">check</span> }

function CompletedPerfectlyTag() { return <span className="episodes-item__icons__tag material-icons">done_all</span> }

// Значок у платного материала, если юзер без подписки
function SubsOnlyTag() { return <span className="episodes-item__icons__tag material-icons">local_atm</span> }