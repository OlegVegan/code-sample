// React
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Firebase
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Helpers
import { human_date, linesDeclension } from "../../common/Helpers"

// Style
import "./EpisodeList__Item.scss";

export function EpisodesListItem({ id, epData, filter, userType, sub }) {

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
    useEffect(() => {
        if (localStorage.getItem('ep_history')) {
            var ep_history = JSON.parse(localStorage.getItem('ep_history'));

            if (!ep_history[id]) {
                setSaved(false)
                setCompleted(false)
                setCompletedPerfectly(false)
            } else {
                if (ep_history[id].saved) {
                    setSaved(true)
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
    if (epData.lines > filter.max || epData.lines < filter.min) return ""

    // Имена участников в зависимости от типа
    function epListNames(type) {
        if (Number(type) === 2) return epData.left + ", " + epData.right
        return epData.left
    }

    return (
        <>
            <Link to={`/episode/${epData.slug}`} style={{ color: 'inherit', textDecoration: 'inherit' }}>
                <div className="episodes-item ctt" data-date={epData.timePublished} >

                    {/* Название */}
                    <div className="episodes-item__name">{epData.name}</div>

                    {/* Персонажи и иконки сохранения и прохождения */}
                    <div className="episodes-item__container2">
                        <div className="episodes-item__icons">
                            {saved ? <SavedTag /> : ""}
                            {completed ? <CompletedTag /> : ""}
                            {completedPerfectly ? <CompletedPerfectlyTag /> : ""}
                            {(sub || epData.free) ? "" : <SubsOnlyTag />}
                        </div>
                        <div className="episodes-item__people">
                            <span className="material-icons tag-icon ep-people-tag" >people</span>
                            {epListNames(epData.type)}
                        </div>
                    </div>

                    {/* Картинка и продолжительность */}
                    <div className="episodes-item__container" style={picStyle}>
                        <div className="episodes-item__duration">{linesDeclension(epData.lines)}, {epData.duration} мин.</div>

                        {/* Дата публикации для админа */}
                        {userType === 'admin' ? <div style={{ padding: "10px", color: "white", fontSize: "30px" }}>{human_date(epData.timePublished.toDate(), false, true)}</div> : ""}
                    </div>
                </div>
            </Link>
        </>
    );
}

function SavedTag() {
    return <span className="episodes-item__icons__tag material-icons" >save</span>
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