// React
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Firebase
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Helpers
import { human_date, linesDeclension } from "../../common/Helpers"

// Style
import "./EpisodesListItem.scss";

export function EpisodesListItem(props) {
    const epData = props.epData
    const id = props.epData.id

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
    if (epData.lines > props.filter.max || epData.lines < props.filter.min) {
        return ""
    }

    // Имена участников в зависимости от типа
    function epListNames(type) {
        if (Number(type) === 2) {
            return epData.left + ", " + epData.right
        } else {
            return epData.left
        }
    }

    return (
        <>
            <Link to={`/episode/${epData.slug}`} style={{ color: 'inherit', textDecoration: 'inherit' }}>
                <div className="episodes-item ctt" data-date={epData.timePublished} >
                    <div className="episodes-item__cover pic-loading" style={picStyle}></div>
                    <div className="episodes-item__textbox">
                        <div className="episodes-item__textbox__name">{epData.name}</div>
                        <div className="episodes-item__textbox__desc" >
                            <span className="material-icons tag-icon ep-people-tag" >people</span>
                            {epListNames(epData.type)}
                        </div>
                    </div>
                    <div className="episodes-item__tag-line">
                        <div className="episodes-item__tag-line__duration">{linesDeclension(epData.lines)}, {epData.duration + " мин."}</div>
                        {saved ? <SavedTag /> : ""}
                        {completed ? <CompletedTag /> : ""}
                        {completedPerfectly ? <CompletedPerfectlyTag /> : ""}
                        {(props.sub || epData.free) ? "" : <SubsOnlyTag />}
                        {props.userData.type === 'admin' ? <div className="episodes-item__tag-line__tag">{human_date(epData.timePublished.toDate(), true, true)}</div> : ""}
                    </div>
                </div>
            </Link>
        </>
    );
}

function SavedTag() {
    return <span className="episodes-item__tag-line__tag material-icons tag-icon" >save</span>
}

function CompletedTag() {
    return <span className="episodes-item__tag-line__tag material-icons tag-icon">check</span>
}

function CompletedPerfectlyTag() {
    return <span className="episodes-item__tag-line__tag material-icons tag-icon">done_all</span>
}

// Значок у платного материала, если юзер без подписки
function SubsOnlyTag() {
    return <span className="episodes-item__tag-line__tag material-icons tag-icon">local_atm</span>
}