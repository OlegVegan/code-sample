// React
import { useState, useEffect, useContext } from "react"

// Components
import Admin from "./Admin"
////
import LineControl from "./Play__LineControl"
import Block from "./Block"
import Over from "../../../common/play/Over"
////
import UserMsg from "../../../common/controls/UserMsg"
import ProgressBar from "../../../common/ProgressBar"
////
import TranslationBtn from "./Controls__TranslationBtn"
import VoiceBtn from "./Controls__VoiceBtn"
import SkipBtn from "./Controls__SkipBtn"

// Functions
import { prepareDataWithId, loadingSaved, scrollToLastLine, autosave, saveCompletion, playSoundAuto } from "./Functions.js"

// Helpers
import { LoadingTag } from "../../../common/Icons"

// Context
import { GlobalContext } from "../../../../GlobalContext"

// Style
import "./Play.scss"
import "../../../common/play/Common.scss"
import "../../../common/controls/UserControls.scss"

export default function EpisodePlay({ logic, setLogic }) {
    const setGloballyPlaying = useContext(GlobalContext).setGloballyPlaying
    const setSiteData = useContext(GlobalContext).setSiteData
    const setAudios = useContext(GlobalContext).setAudios
    const audios = useContext(GlobalContext).audios
    const user = useContext(GlobalContext).userData

    // Загрузка данных
    useEffect(() => {
        launchPrep()
        async function launchPrep() {
            const preparedData = await prepareDataWithId(logic.id)
            setSiteData(p => ({ ...p, crumbs: 'episode_play', crumbsExtra: preparedData.name }))
            setLogic(p => ({ ...p, ready: true, data: preparedData, overallBlocks: preparedData.script.length - 1 }))
        }
    }, [])

    // Запуск 
    useEffect(() => {
        if (!logic.ready) return

        // Очистка звуков c других эпизодов
        setAudios(null)

        if (logic.loading) {
            loadingSaved(logic, setLogic)
            scrollToLastLine()
        } else {
            setLogic(p => ({ ...p, currentBlock: 0 }))
        }

    }, [logic.ready])

    // Смена строк
    useEffect(() => {
        // Если строка ещё не сменилась
        if (typeof logic.currentBlock !== "number") return

        // Cбрасываем фейлы и карту совпадений слов у активной строки
        var freshWordMap = logic.createWordMap()
        setLogic(p => ({ ...p, failsCurrent: 0, wordMap: freshWordMap }))

        // Закончились ли мои строки
        if (logic.myBlocksOver()) {

            // Мои строки закончились, сохраняем, играем дальше, если есть куда
            saveCompletion(logic)
            playSoundAuto(audios, logic, setLogic, setAudios)

        } else {
            autosave(logic)
            if (logic.over) {
                setLogic(p => ({ ...p, autoSound: false }))
                saveCompletion(logic)
                scrollToLastLine()

            } else {
                playSoundAuto(audios, logic, setLogic, setAudios)
            }
        }

        scrollToLastLine()

    }, [logic.currentBlock, logic.over])

    // Глобально на сайте играет индекс
    useEffect(() => {
        if (!logic.playing) return
        setGloballyPlaying(logic.currentlyPlaying)
    }, [logic.currentlyPlaying])

    const [linePics, setLinePics] = useState(null)

    if (!logic.ready || !logic.data?.script) return <div className="play-continer"><LoadingTag /></div>
    return (
        <div className="play-continer">
            <Admin logic={logic} setLogic={setLogic} userRole={user.role} audios={audios} linePics={linePics} />

            <LineControl logic={logic} setLogic={setLogic} />
            <div id="episode-lines" className={logic.showAllBlocks ? "full-line-list" : "short-line-list"}>
                {logic.data.script.map((data, index) => {
                    return <Block
                        linePics={linePics}
                        setLinePics={setLinePics}
                        logic={logic}
                        setLogic={setLogic}
                        id={logic.id}
                        key={data.order}
                        index={index}
                        audios={audios} />
                })}
                <Over over={logic.over} page={"/episodes"} />
            </div>

            <div className="sticky-bottom-block">
                <UserMsg logic={logic} setLogic={setLogic} />
                <ProgressBar bar={logic.currentBlock} bars={logic.overallBlocks} />
                <div className="controls">
                    <TranslationBtn logic={logic} setLogic={setLogic} />
                    <VoiceBtn logic={logic} setLogic={setLogic} audios={audios} />
                    <SkipBtn logic={logic} setLogic={setLogic} audios={audios} />
                </div>
            </div>
        </div>
    )
}