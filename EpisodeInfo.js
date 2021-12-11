// React
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select"

// Style
import "./EpisodeInfo.scss";

// Helpers
import { human_date } from "../../common/Helpers";
import { LoadingTag } from "../../common/Icons";
import { linesDeclension } from "../../common/Helpers";

// Components
import { PicBlock } from "./EpisodeInfoPics"
import { LaunchBlock, GottaSubBlock } from "./EpisodeInfoLaunchBlock"

export function EpisodeInfo(props) {
    const epData = props.epData;
    const id = props.epData.id;

    useEffect(() => {
        props.setCrumbs('edisode_info')
    }, [])

    // Список опций за кого играть
    const [optionsMode, setOptionsMode] = useState([{ value: 1, label: "" }]);
    useEffect(() => {
        if (Number(epData.type) === 1) {
            setOptionsMode([{ value: 1, label: `${epData.left}` }]);
        } else {
            setOptionsMode([{ value: 1, label: `${epData.left}` }, { value: 2, label: `${epData.right}` }, { value: 3, label: "за всех сразу" },]);
        }
    }, [epData])

    if (!epData) return <><br /> <br /><LoadingTag /></>
    return (
        <>
            <div id="episode-info">
                {/* Кнопка редактирования для админа*/}
                {props.userData.type === 'admin' ? <EpisodeEditBtn {...props} /> : ""} <br />

                {/* Инфа о прохождении */}
                <ExtraInfo id={id} />

                {/* Текстовая информация */}
                <div id="episode-start-text-top">
                    <div id="episode-start-date" className="ctt">Опубликовано {human_date(epData.timePublished.toDate(), true, true)}</div>
                    <div id="episode-start-name">{epData.name}</div>
                    <div id="episode-start-duration" className="ctt">{"~" + epData.duration + " минут"}</div>
                    <div id="episode-start-desc">{epData.desc}</div>
                </div>

                {/* Картинки */}
                <PicBlock {...props} type={epData.type} />

                {/* Количество строк */}
                <div id="episode-start-line-counter" className="ctt">
                    <div id="line-counter-left" className={(props.mode === 1 || props.mode === 3) ? "line-counter-div" : "line-counter-div pointy"} onClick={() => props.setMode(1)}>
                        <div id="line-counter-left-info">{linesDeclension(epData.lines_left)}</div>
                    </div>
                    {Number(epData.type) === 2 ? <div id="line-counter-right" className={(props.mode === 2 || props.mode === 3) ? "line-counter-div" : "line-counter-div pointy"} onClick={() => props.setMode(2)}><div id="line-counter-right-info">{linesDeclension(epData.lines_right)}</div></div> : ""}
                </div> <br />

                {/* Выбор персонажа, если монолог, то нет выбора */}
                <Select id={"episode-start-mode-select"}
                    theme={theme => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                            ...theme.colors,
                            ...props.selectTheme
                        }
                    })}
                    onChange={option => props.setMode(option.value)}
                    options={optionsMode}
                    value={optionsMode.filter(option => option.value === props.mode)}
                    isDisabled={Number(epData.type) === 1 ? true : false}
                    isSearchable={false} />

                {/* Сообщение про монолог */}
                {Number(epData.type) === 1 ? <MonoMsg /> : ""}

                {/* Запуск эпизода в зависимости от наличия саба и сейва */}
                {(epData.free || (!epData.free && props.sub)) ? <LaunchBlock {...props} id={id} /> : <GottaSubBlock />}
            </div>
        </>
    );
}

function EpisodeEditBtn(props) {
    return (
        <>
            <br />
            <Link to={`/episode_editor/${props.epData.id}`}>
                <input value="Редактировать" type="button" />
            </Link>
            <br />
        </>
    );
}

function MonoMsg() {
    return (
        <>
            <br />
            <br />
            <span id="its-a-monologue" className="ctt">Это монолог, тут только одна роль</span>
        </>
    );
}

function ExtraInfo(props) {
    const id = props.id

    const [saved, setSaved] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [completedPerfectly, setCompletedPerfectly] = useState(false)

    useEffect(() => {
        if (localStorage.getItem('ep_history')) {
            var ep_history = JSON.parse(localStorage.getItem('ep_history'));
            if (ep_history[id]) {
                if ((ep_history[id].timesPassed > 0) && (ep_history[id].failsRecord > 0)) {
                    setCompleted(true)
                }
                if ((ep_history[id].timesPassed > 0) && (ep_history[id].failsRecord === 0)) {
                    setCompletedPerfectly(true)
                }
                if (ep_history[id].saved) {
                    setSaved(true)
                }
            }
        }
    }, [])

    return (
        <>
            <br />
            {/* {saved ? <><span className="material-icons tag-icon">save</span><span> Есть сохранение</span><br /></> : ""} */}
            {completed ? <><span className="material-icons tag-icon">check</span><span> Пройдено</span></> : ""}
            {completedPerfectly ? <><span className="material-icons tag-icon">done_all</span><span> Пройдено идеально</span></> : ""}
            <br />
        </>
    );
}