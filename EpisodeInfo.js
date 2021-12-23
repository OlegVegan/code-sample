// React
import { useState, useEffect, useContext } from "react"
import Select from "react-select"

// Firebase
import { getStorage, ref, getDownloadURL } from "firebase/storage"

// Context
import { GlobalContext } from "../../../../GlobalContext"

// Style
import "./EpisodeInfo.scss";

// Helpers
import { LoadingTag } from "../../../common/Icons"
import { linesDeclension, minutesDeclension, humanDate } from "../../../common/Helpers"

// Components
import EditBtn from "../../../common/material-info/EditBtn"
import Extra from "../../../common/material-info/Extra"
import PicBlock from "./EpisodeInfo__Pics"
import LaunchBlock from "../../../common/material-info/LaunchBlock"
import NoSub from "../../../common/material-info/NoSub"

export function EpisodeInfo({ id, data, logic, setLogic }) {
    const user = useContext(GlobalContext).userData
    const setSiteData = useContext(GlobalContext).setSiteData
    const selectTheme = useContext(GlobalContext).selectTheme

    const storage = getStorage();

    // Звуки для картинок эпизода
    const [infoAudios, setInfoAudios] = useState()
    useEffect(() => {
        setSiteData(p => ({ ...p, topBlock: null, crumbs: 'episode_info' }))

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
                <EditBtn id={id} page={'episode'} userRole={user.role} />

                {/* Инфа о прохождении */}
                {/* <Extra id={id} storageItem={'ep_history'} /> */}

                {/* Текстовая информация */}
                <div id="episode-info-top-text">
                    <div id="episode-info-date" className="ctt">Опубликовано {humanDate(data.timePublished.toDate(), true, true)}</div>
                    <div id="episode-info-name">{data.name}</div>
                    <div id="episode-info-duration" className="ctt">{"~ " + minutesDeclension(data.duration)}</div>
                    <div id="episode-info-desc">{data.desc}</div>
                </div>

                {/* Картинки */}
                <PicBlock id={id} type={data.type} infoAudios={infoAudios} logic={logic} setLogic={setLogic} />

                {/* Количество строк */}
                <div id="episode-line-counter" className="ctt">
                    <div className={(logic.mode === 1 || logic.mode === 3) ? "line-counter-div" : "line-counter-div pointy"} onClick={() => setLogic(p => ({ ...p, mode: 1 }))}>
                        <div>{linesDeclension(data.lines_left)}</div>
                    </div>
                    {Number(data.type) === 2 ? <div className={(logic.mode === 2 || logic.mode === 3) ? "line-counter-div" : "line-counter-div pointy"} onClick={() => setLogic(p => ({ ...p, mode: 2 }))}>
                        <div id="line-counter-right-info">{linesDeclension(data.lines_right)}</div>
                    </div> : ""}
                </div> <br />

                {/* Выбор персонажа, если монолог, то нет выбора */}
                <Select id={"episode-info-mode-select"}
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
                {data.type === 1 ? <span style={{ color: "var(--text3)", marginTop: "20px", display: "block" }} className="ctt">Это монолог, тут только одна роль</span> : ""}

                {/* Запуск эпизода в зависимости от наличия саба */}
                {(data.free || (!data.free && user.sub)) ? <LaunchBlock id={id} name={data.name} infoAudios={infoAudios} logic={logic} setLogic={setLogic} /> : <NoSub />}
            </div>
        </>
    )
}
