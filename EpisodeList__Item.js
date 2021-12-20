// React
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";

// Firebase
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Helpers
import { human_date, linesDeclension } from "../../common/Helpers"

// Context
import { GlobalContext } from "../../../GlobalContext";

// Style
import "./EpisodeList__Item.scss";

export function EpisodesListItem({ id, data, filter }) {
    const user = useContext(GlobalContext).userData

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
    const [savedProgress, setSavedProgress] = useState(null) // todo: пока нигде не используется
    useEffect(() => {
        if (localStorage.getItem('ep_history')) {
            var ep_history = JSON.parse(localStorage.getItem('ep_history'))

            // Процент прогресса сохранения
            function getPercent() {
                return Math.round(((data.lines_left + data.lines_right + data.lines_center) / ep_history[id].currentLine) * 10) / 10
            }

            if (!ep_history[id]) {
                setSaved(false)
                setCompleted(false)
                setCompletedPerfectly(false)
            } else {
                if (ep_history[id].saved) {
                    setSaved(true)
                    setSavedProgress(getPercent() + "%")
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
            <Link to={`/episode/${data.slug}`} style={{ color: 'inherit', textDecoration: 'inherit' }}>
                <div className="episodes-item ctt" data-date={data.timePublished} >

                    {/* Название */}
                    <div className="episodes-item__name">{data.name}</div>

                    {/* Персонажи и иконки сохранения и прохождения */}
                    <div className="episodes-item__container2">
                        <div className="episodes-item__icons">
                            {saved ? <SavedTag /> : ""}
                            {completed ? <CompletedTag /> : ""}
                            {completedPerfectly ? <CompletedPerfectlyTag /> : ""}
                            {(user.sub || data.free) ? "" : <SubsOnlyTag />}
                        </div>
                        <div className="episodes-item__people">
                            <span className="material-icons tag-icon ep-people-tag" >people</span>
                            {epListNames(data.type)}
                        </div>
                    </div>

                    {/* Картинка и продолжительность */}
                    <div className="episodes-item__container" style={picStyle}>
                        <div className="episodes-item__duration">{linesDeclension(data.lines)}, {data.duration} мин.</div>

                        {/* Дата публикации для админа */}
                        {user.role === 'admin' ? <div style={{ padding: "10px", color: "white", fontSize: "30px", float: "right", textShadow: "#000 2px 2px 2px" }}>{human_date(data.timePublished.toDate(), false, true)}</div> : ""}

                        {/* Прогресс бар прохождения todo: */}
                        {/* <div style={{ height: "10px", backgroundColor: "yellow", float: "left", width: savedProgress }}></div> */}
                    </div>
                </div>
            </Link>
        </>
    );
}

function SavedTag() {
    return <span className="episodes-item__icons__tag material-icons">save</span>
}

function CompletedTag() {
    return <span className="episodes-item__icons__tag material-icons">check</span>
}

function CompletedPerfectlyTag() {
    return <span className="episodes-item__icons__tag material-icons">done_all</span>
}

// Значок у платного материала, если юзер без подписки
function SubsOnlyTag() {
    return <span className="episodes-item__icons__tag material-icons">local_atm</span>
}