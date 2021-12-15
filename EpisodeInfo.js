// React
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"

// Firebase
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Contexts
import { GlobalContext } from "../../../../GlobalContext";

// Style
import "./EpisodeInfo.scss";

// Helpers
import { human_date } from "../../../common/Helpers";
import { LoadingTag } from "../../../common/Icons";
import { linesDeclension } from "../../../common/Helpers";

// Components
import { PicBlock } from "./EpisodeInfo__Pics"
import { LaunchBlock } from "./EpisodeInfo__LaunchBlock"
import NoSub from "./EpisodeInfo__LaunchBlock__NoSub"
import Extra from "./EpisodeInfo__Extra"

export function EpisodeInfo({ id, data, logic, setLogic }) {
    const user = useContext(GlobalContext).userData
    const setSiteData = useContext(GlobalContext).setSiteData
    const selectTheme = useContext(GlobalContext).selectTheme

    const navigate = useNavigate()
    const storage = getStorage();

    // Звуки для картинок эпизода
    const [infoAudios, setInfoAudios] = useState()
    useEffect(() => {
        setSiteData(p => ({ ...p, topBlock: null, crumbs: 'edisode_info' }))

        // Звуки для картинок
        var dummy = {};
        getDownloadURL(ref(storage, 'episodes/' + id + '/left.mp3')).then((url) => {
            var myAudio = new Audio(url)
            dummy['left'] = myAudio
        })

        // Звук для второй картинки не нужен, если это монолог
        if (data.type !== 1) {
            getDownloadURL(ref(storage, 'episodes/' + id + '/right.mp3')).then((url) => {
                var myAudio = new Audio(url)
                dummy['right'] = myAudio
            })
        }

        setInfoAudios(dummy)
    }, [])

    // Опции выбора за кого играть
    const [optionsMode, setOptionsMode] = useState([{ value: 1, label: "" }]);
    useEffect(() => {
        if (Number(data.type) === 1) return setOptionsMode([{ value: 1, label: `${data.left}` }]);
        return setOptionsMode([{ value: 1, label: `${data.left}` }, { value: 2, label: `${data.right}` }, { value: 3, label: "за всех сразу" },]);
    }, [data])

    if (!data) return <><div id="episode-info"><LoadingTag /></div></>
    return (
        <>
            <div id="episode-info">
                {/* Кнопка редактирования для админа*/}
                {user.role === 'admin' ? <input value="Редактировать" type="button" onClick={() => navigate(`/episode_editor/${id}`)} /> : ""} <br />

                {/* Инфа о прохождении */}
                <Extra id={id} />

                {/* Текстовая информация */}
                <div id="episode-start-text-top">
                    <div id="episode-start-date" className="ctt">Опубликовано {human_date(data.timePublished.toDate(), true, true)}</div>
                    <div id="episode-start-name">{data.name}</div>
                    <div id="episode-start-duration" className="ctt">{"~" + data.duration + " минут"}</div>
                    <div id="episode-start-desc">{data.desc}</div>
                </div>

                {/* Картинки */}
                <PicBlock id={id} type={data.type} infoAudios={infoAudios} logic={logic} setLogic={setLogic} />

                {/* Количество строк */}
                <div id="episode-start-line-counter" className="ctt">
                    <div id="line-counter-left" className={(logic.mode === 1 || logic.mode === 3) ? "line-counter-div" : "line-counter-div pointy"} onClick={() => setLogic(p => ({ ...p, mode: 1 }))}>
                        <div id="line-counter-left-info">{linesDeclension(data.lines_left)}</div>
                    </div>
                    {Number(data.type) === 2 ? <div id="line-counter-right" className={(logic.mode === 2 || logic.mode === 3) ? "line-counter-div" : "line-counter-div pointy"} onClick={() => setLogic(p => ({ ...p, mode: 2 }))}><div id="line-counter-right-info">{linesDeclension(data.lines_right)}</div></div> : ""}
                </div> <br />

                {/* Выбор персонажа, если монолог, то нет выбора */}
                <Select id={"episode-start-mode-select"}
                    theme={theme => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                            ...theme.colors,
                            ...selectTheme
                        }
                    })}
                    onChange={option => setLogic(p => ({ ...p, mode: option.value }))}
                    options={optionsMode}
                    value={optionsMode.filter(option => option.value === logic.mode)}
                    isDisabled={Number(data.type) === 1 ? true : false}
                    isSearchable={false} />

                {/* Сообщение про монолог */}
                {data.type === 1 ? <span style={{ color: "var(--text3)", margin: "20px", display: "block" }} className="ctt">Это монолог, тут только одна роль</span> : ""}

                {/* Запуск эпизода в зависимости от наличия саба и сейва */}
                {(data.free || (!data.free && user.sub)) ? <LaunchBlock id={id} name={data.name} infoAudios={infoAudios} logic={logic} setLogic={setLogic} /> : <NoSub />}
            </div>
        </>
    );
}
