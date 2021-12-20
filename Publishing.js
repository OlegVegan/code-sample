// React
import { useContext, useState, useEffect } from "react";
import Select from "react-select";

// Firebase
import { db } from "../../../fb"
import { getDocs, getDoc, query, collection, setDoc, doc, deleteDoc, updateDoc, onSnapshot, where } from 'firebase/firestore';

// Context
import { GlobalContext } from "../../../GlobalContext";

export default function Publishing({ data, setData, logic, setLogic }) {
    const user = useContext(GlobalContext).userData

    // Список редакторов
    const [listOfEditors, setListOfEditors] = useState([]);
    useEffect(() => {
        onSnapshot(query(collection(db, "administrators"), where("editor", "==", true)), (querySnapshot) => {
            querySnapshot.forEach((editorData) => {
                setListOfEditors(prev => [...prev, { value: editorData.id, label: editorData.data().email }]);
            });
        });
    }, [])

    // Почта редактора для лейбла в селекте
    useEffect(() => {
        if (listOfEditors) {
            listOfEditors.forEach((editorName) => {
                if (editorName.value === data.belongsTo) {
                    setLogic(p => ({ ...p, selectedEditor: editorName.label }))
                }
            })
        }
    }, [data.belongsTo, listOfEditors])

    function publish() {
        // Проверка на наличие и уникальность slug
        if (!data.slug) {
            return alert('Нельзя публиковать без слага')
        } else {
            // Проверка на уникальность слага
            var all_slugs = []
            getDocs(query(collection(db, logic.page + "-prod"))).then((snappy) => {
                snappy.forEach(ep => {
                    if (ep.data().slug) {
                        all_slugs.push(ep.data().slug)
                    }
                });
            }).then(() => {
                if (all_slugs.includes(data.slug)) {
                    return alert('Слаг "' + data.slug + '" уже используется в другом материале. Слаги должны быть уникальными')
                } else {
                    if (window.confirm('Опубликовать?')) {
                        if (window.confirm('Сперва надо сохранить вручную. Всё сохранено?')) {
                            updateDoc(doc(db, logic.page, logic.id), {
                                belongsTo: 'public'
                            }).then(() => {
                                setLogic(p => ({ ...p, showAdminSaveBtn: false }))
                                // Копирование на прод
                                getDoc(doc(db, logic.page, logic.id)).then((draft) => {
                                    setDoc(doc(db, logic.page + "-prod", logic.id), draft.data());
                                }).then(() => {
                                    setData(p => ({ ...p, belongsTo: 'public' }))
                                    setLogic(p => ({ ...p, adminMsg: 'Опубликовано' }))
                                    setTimeout(() => {
                                        setLogic(p => ({ ...p, showAdminSaveBtn: true, adminMsg: '' }))
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
            updateDoc(doc(db, logic.page, logic.id), {
                belongsTo: user.id
            }).then(() => {
                setLogic(p => ({ ...p, showAdminSaveBtn: false }))
                // Удаление с прода
                deleteDoc(doc(db, logic.page + "-prod", logic.id)).then(() => {
                    setData(p => ({ ...p, belongsTo: user.id }))
                    setLogic(p => ({ ...p, adminMsg: 'Снято с публикации' }))
                    setTimeout(() => {
                        setLogic(p => ({ ...p, showAdminSaveBtn: true, adminMsg: '' }))
                    }, 3000);
                });
            });
        }
    }

    if (data.belongsTo === 'public') {
        return (
            <>
                <br />
                <input type="button" value="Снять с публикации" onClick={() => unpublish()} />
                <br />
            </>
        )

    } else {
        return (
            <>
                <br />
                <br />
                <span>Редактор: </span>
                <Select
                    id="episode-edit-belongs-to"
                    className={"editor-select2"}
                    onChange={option => setData(p => ({ ...p, belongsTo: option.value }))}
                    options={listOfEditors}
                    value={listOfEditors.filter(option => option.value === data.belongsTo)}
                    isSearchable={false} />
                <br />

                <input type="button" value="Опубликовать" onClick={() => publish()} />
                <br />
                <br />
            </>
        )
    }
}
