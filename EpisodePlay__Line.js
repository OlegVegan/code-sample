// React
import { useState, useEffect } from "react"

// Firebase
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Helpers
import { LoadingTag } from "../../../common/Icons";

// Components
import Word from "./EpisodePlay__Line__Word"

// Functions
import { playSoundUser } from "./EpisodePlay__Sound"

// Style
import "./EpisodePlay__Line.scss"

export default function Line({ id, notes, lineIndex, logic, setLogic, audios }) {
    const storage = getStorage();

    const order = logic.data.script[lineIndex].order
    const name = logic.data.script[lineIndex].name
    const type = logic.data.script[lineIndex].type
    const text = logic.data.script[lineIndex].text
    const tran = logic.data.script[lineIndex].russian

    // Картинка
    const [picStyle, setStyle] = useState({
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'var(--bg2)'
    })

    useEffect(() => {
        getDownloadURL(ref(storage, 'episodes/' + id + '/line_pics/' + name + '.jpg')).then((url) => {
            setStyle({
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: 'url(' + url + ')'
            })
        })
        console.log('logic.highlightedLine()' + logic.highlightedLine())
    }, [])

    // Стиль строки
    const [picClasses, setPicClasses] = useState()
    useEffect(() => {
        if (logic.highlightedLine() === lineIndex) {
            if (type === 'left') return setPicClasses('line-picture pic-loading current-line-highlight')
            if (type === 'right') return setPicClasses('line-picture pic-loading current-line-highlight')
            if (type === 'center') return setPicClasses('center-pic pic-loading current-line-highlight')
        } else {
            if (type === 'left') return setPicClasses('line-picture left-pic pic-loading')
            if (type === 'right') return setPicClasses('line-picture pic-loading')
            if (type === 'center') return setPicClasses('center-pic pic-loading')
        }
        console.log('ogic.highlightedLine()');
        console.log(logic.highlightedLine());
    }, [logic.currentLine, logic.currentlyPlaying])

    function handleClick() {
        playSoundUser(order, audios, logic, setLogic)
    }

    // Не показываем строчки, которые выше активной
    if (logic.letMeSee) {
        // Даёт админу видеть весь сценарий
    } else {
        if (lineIndex > logic.currentLine || logic.letMeSee) return ""
    }

    if (type === 'left') {
        return (
            <>
                <div className=" left-line">
                    <div onClick={() => handleClick()} className={picClasses} style={picStyle}>
                        {picStyle ? "" : <LoadingTag />}
                    </div>
                    <div className="upper-left-line-text">
                        {text.map((word, index) => <Word logic={logic} notes={notes} wordData={word} wordIndex={index} lineIndex={lineIndex} key={index} />)}
                    </div>
                    {logic.showTranslation ? <div className="lower-left-line-text">{tran}</div> : ""}
                </div>
            </>
        )
    } else if (type === 'right') {
        return (
            <>
                <div className=" right-line">
                    <div onClick={() => handleClick()} className={picClasses} style={picStyle}>
                        {picStyle ? "" : <LoadingTag />}
                    </div>
                    <div className="upper-right-line-text">
                        {text.map((word, index) => <Word logic={logic} notes={notes} wordData={word} wordIndex={index} lineIndex={lineIndex} key={index} />)}
                    </div>
                    {logic.showTranslation ? <div className="lower-right-line-text">{tran}</div> : ""}
                </div>
            </>
        )
    } else if (type === 'center') {
        return (
            <>
                <div className="center-line">
                    <div className="film-frame">

                        <div className="film-reel-left">
                            <div className="film-reel-hole"></div>
                            <div className="film-reel-hole"></div>
                            <div className="film-reel-hole"></div>
                            <div className="film-reel-hole"></div>
                        </div>

                        <div onClick={() => handleClick()} className={picClasses} style={picStyle}>
                            {picStyle ? "" : <LoadingTag />}
                        </div>

                        <div className="film-reel-right">
                            <div className="film-reel-hole"></div>
                            <div className="film-reel-hole"></div>
                            <div className="film-reel-hole"></div>
                            <div className="film-reel-hole"></div>
                        </div>

                    </div>
                    {tran ? <div className="center-line-text">{tran}</div> : ""}
                </div>
            </>
        )
    }
}