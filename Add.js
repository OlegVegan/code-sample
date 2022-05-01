// React
import { useRef, useState, useEffect } from "react"

// Helpers
import { NumbersOnly } from "../../../common/functions/Helpers"

export default function New({ logic, setLogic }) {
    const data = logic.data
    const orderInp = useRef()

    const [order, setOrder] = useState('0000')

    // Значения для нового блока автоматически прибавляются 
    useEffect(() => {
        if (!data?.script || data.script.length === 0) return setOrder('0000')
        if (data.script.length > 0) {
            setOrder(NumbersOnly((Number(logic.lastOrder()) + 5), 4, true))
            orderInp.current.value = NumbersOnly((Number(logic.lastOrder()) + 5), 4, true)
        }
    }, [data.script])

    function addNew() {
        // Проверяем корректность ввода числа
        var checked_num = NumbersOnly(orderInp.current.value, 4, true)
        setOrder(checked_num)

        // Проверка на уникальность порядка
        if (data.script.filter((block) => block.order === checked_num).length > 0) {
            alert('Порядковые номера должны быть уникальными, а ' + checked_num + " уже есть");
        } else {
            orderInp.current.value = checked_num

            var new_line = { order: checked_num, russian: "", task: [], mustuse: "", newline: false }

            var new_script = [...data.script]
            new_script.push(new_line)

            var new_data = logic.data
            new_data.script = new_script
            setLogic(p => ({ ...p, data: new_data }))
        }
    }

    if (data.script.length > logic.blockLimit) return ""
    return (
        <div className="editor-add-new">
            #️⃣
            <input onChange={() => setOrder(orderInp.current.value)}
                ref={orderInp}
                className="editor-number-input"
                type="text"
                defaultValue={order} />

            <input onClick={() => addNew()} type="button" value="Добавить новый блок" />
            <br />

            <h4>Порядковые номера должны быть уникальными</h4>
        </div>
    )
}