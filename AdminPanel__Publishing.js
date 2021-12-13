// React
import Select from "react-select";

// Firebase
import { db } from "../../../fb"
import { getDocs, getDoc, query, collection, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function Publishing({ page, id, slug, belongsTo, setBelongsTo, listOfEditors, setShowSaveBtn, setAdminMsg, userId }) {
    function publish() {
        // Проверка на наличие и уникальность slug
        if (!slug) {
            return alert('Нельзя публиковать без слага')
        } else {
            // Проверка на уникальность слага
            var all_slugs = []
            getDocs(query(collection(db, page + "-prod"))).then((snappy) => {
                snappy.forEach(ep => {
                    if (ep.data().slug) {
                        all_slugs.push(ep.data().slug)
                    }
                });
            }).then(() => {
                if (all_slugs.includes(slug)) {
                    return alert('Слаг "' + slug + '" уже используется в другом материале. Слаги должны быть уникальными')
                } else {
                    if (window.confirm('Опубликовать?')) {
                        if (window.confirm('Сперва надо сохранить вручную. Всё сохранено?')) {
                            updateDoc(doc(db, page, id), {
                                belongsTo: 'public'
                            }).then(() => {
                                setShowSaveBtn(false)
                                // Копирование на прод
                                getDoc(doc(db, page, id)).then((draft) => {
                                    setDoc(doc(db, page + "-prod", id), draft.data());
                                }).then(() => {
                                    setBelongsTo('public')
                                    setAdminMsg('Опубликовано')
                                    setTimeout(() => {
                                        setAdminMsg('')
                                        setShowSaveBtn(true)
                                    }, 3000);
                                })
                            });
                        }
                    }
                }
            });
        }
    }

    // Когда админ снимает с публикации, то ставим на его имя, а не на имя предыдущего редактора
    function unpublish() {
        if (window.confirm('Снять с публикации?')) {
            updateDoc(doc(db, page, id), {
                belongsTo: userId
            }).then(() => {
                setShowSaveBtn(false)
                // Удаление с прода
                deleteDoc(doc(db, page + "-prod", id)).then(() => {
                    setBelongsTo(userId)
                    setAdminMsg('Снято с публикации')
                    setTimeout(() => {
                        setAdminMsg('')
                        setShowSaveBtn(true)
                    }, 3000);
                });
            });
        }
    }

    if (belongsTo === 'public') {
        return (
            <>
                <br />
                <input type="button" value="Снять с публикации" onClick={() => unpublish()} />
                <br />
            </>
        );

    } else {
        return (
            <>
                <br />
                <br />
                <span>Редактор: </span>
                <Select
                    id="episode-edit-belongs-to"
                    className={"episode-editor-select"}
                    onChange={option => setBelongsTo(option.value)}
                    options={listOfEditors}
                    value={listOfEditors.filter(option => option.value === belongsTo)}
                    isSearchable={false} />
                <br />

                <input type="button" value="Опубликовать" onClick={() => publish()} />
                <br />
                <br />
            </>
        );
    }
}
