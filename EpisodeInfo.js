// React
import { useState, useEffect, useContext } from "react"
import Select from "react-select"

// Firebase
import { getStorage, ref, getDownloadURL } from "firebase/storage"

// Context
import { GlobalContext } from "../../../../GlobalContext"

// Style
import "./EpisodeInfo.scss"
import "../../../common/material-info/MaterialInfo.scss"

// Helpers
import { LoadingTag } from "../../../common/Icons"
import { linesDeclension, minutesDeclension, humanDate } from "../../../common/Helpers"

// Components
import EditBtn from "../../../common/material-info/EditBtn"
import Extra from "../../../common/material-info/Extra"
import PicBlock from "./EpisodeInfo__Pics"
import MonoMsg from "./EpisodeInfo__MonoMsg"
import LaunchBlock from "../../../common/material-info/LaunchBlock"
import NoSub from "../../../common/material-info/NoSub"

export function EpisodeInfo({ logic, setLogic }) {
    const killAudios = useContext(GlobalContext).killAudios
    const user = useContext(GlobalContext).userData
    const setSiteData = useContext(GlobalContext).setSiteData
    const selectTheme = useContext(GlobalContext).selectTheme
    const storage = getStorage()

    // Звуки для картинок
    const [infoAudios, setInfoAudios] = useState()
    // Можно ли запускать
    const [canLaunch, setCanLaunch] = useState(false)
    useEffect(() => {
        killAudios()
        setSiteData(p => ({ ...p, topBlock: null, crumbs: 'episode_info' }))

        // Звуки для картинок
        var futureAudios = {}
        getDownloadURL(ref(storage, 'episodes/' + logic.id + '/left.mp3')).then((url) => {
            var myAudio = new Audio(url)
            futureAudios['left'] = myAudio
        })

        // Звук для второй картинки не нужен, если это монолог
        if (logic.data.type === 2) {
            getDownloadURL(ref(storage, 'episodes/' + logic.id + '/right.mp3')).then((url) => {
                var myAudio = new Audio(url)
                futureAudios['right'] = myAudio
            })
        }

        setInfoAudios(futureAudios)

        // Проверка на доступность материала
        setCanLaunch(() => {
            if (logic.data.free || (!logic.data.free && user.subbed)) return true
            return false
        })
    }, [user.subbed])

    // Опции выбора за кого играть
    const [optionsMode] = useState(() => {
        if (Number(logic.data.type) === 1) {
            return [{ value: 1, label: `${logic.data.left}` }]
        }
        return [{ value: 1, label: `${logic.data.left}` }, { value: 2, label: `${logic.data.right}` }, { value: 3, label: "за всех сразу" },]
    })

    if (!logic.data) return <><div id="episode-info"><LoadingTag /></div></>
    return (
        <>
            <div id="episode-info">
                {/* Кнопка редактирования для админа*/}
                <EditBtn id={logic.id} page={'episode'} userRole={user.role} />

                {/* Инфа о прохождении */}
                {/* <Extra id={id} storageItem={'ep_history'} /> */}

                {/* Текстовая информация */}
                <div className="info-top-text">
                    <div className="info-date ctt">Опубликовано {humanDate(logic.data.timePublished.toDate(), true, true)}</div>
                    <div className="info-name">{logic.data.name}</div>
                    <div className="info-duration ctt">{"~ " + minutesDeclension(logic.data.duration)}</div>
                    <div className="info-desc">{logic.data.desc}</div>
                </div>

                {/* Картинки */}
                <PicBlock type={logic.data.type} infoAudios={infoAudios} logic={logic} setLogic={setLogic} />

                {/* Количество строк */}
                <div id="episode-line-counter" className="ctt">
                    <div className={(logic.mode === 1 || logic.mode === 3) ? "line-counter-div" : "line-counter-div pointy"} onClick={() => setLogic(p => ({ ...p, mode: 1 }))}>
                        <div>
                            {linesDeclension(logic.data.lines_left)}
                        </div>
                    </div>
                    {Number(logic.data.type) === 2 ? <div className={(logic.mode === 2 || logic.mode === 3) ? "line-counter-div" : "line-counter-div pointy"} onClick={() => setLogic(p => ({ ...p, mode: 2 }))}>
                        <div id="line-counter-right-info">
                            {linesDeclension(logic.data.lines_right)}
                        </div>
                    </div> : ""}
                </div> <br />

                {/* Выбор персонажа, если монолог, то нет выбора */}
                {Number(logic.data.type) === 1 ? <MonoMsg name={optionsMode[0].label} /> :
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
                        isDisabled={Number(logic.data.type) === 1 ? true : false}
                        isSearchable={false} />}

                {/* Запуск эпизода в зависимости от наличия саба */}
                {canLaunch ? <LaunchBlock id={logic.id} name={logic.data.name} infoAudios={infoAudios} page="episodes" setLogic={setLogic} /> : <NoSub />}
            </div>
        </>
    )
}