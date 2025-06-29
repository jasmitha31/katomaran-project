import { useEffect, useState } from "react"
import io from "socket.io-client"
import axios from "axios"
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth"
import { initializeApp } from "firebase/app"

const s = io("http://localhost:5000")
const f = {
    apiKey: "your_key",
    authDomain: "your_project.firebaseapp.com",
    projectId: "your_project",
    storageBucket: "your_project.appspot.com",
    messagingSenderId: "id",
    appId: "id"
}
initializeApp(f)

function App() {
    const [l, setL] = useState([])
    const [t, setT] = useState("")
    const [d, setD] = useState("")
    const [p, setP] = useState("")
    const [sT, setST] = useState("pending")
    const [tok, setTok] = useState("")

    const load = async () => {
        const r = await axios.get("/api/tasks", { headers: { Authorization: `Bearer ${tok}` } })
        setL(r.data)
    }

    useEffect(() => {
        s.on("refresh", load)
        return () => s.off("refresh")
    }, [tok])

    const login = async () => {
        const a = getAuth()
        const u = await signInWithPopup(a, new GoogleAuthProvider())
        const e = u.user.email
        const r = await axios.post("/api/token", { email: e })
        setTok(r.data.token)
    }

    const create = async () => {
        await axios.post("/api/tasks", {
            title: t, description: d, priority: p, status: sT
        }, { headers: { Authorization: `Bearer ${tok}` } })
        s.emit("update")
        setT("")
        setD("")
        setP("")
    }

    return (
        <div>
            <h1>Todo App</h1>
            {!tok ? <button onClick={login}>Login with Google</button> : <>
                <input value={t} onChange={e => setT(e.target.value)} placeholder="Title" />
                <input value={d} onChange={e => setD(e.target.value)} placeholder="Description" />
                <input value={p} onChange={e => setP(e.target.value)} placeholder="Priority" />
                <button onClick={create}>Add</button>
                <ul>{l.map(x => <li key={x._id}>{x.title}</li>)}</ul>
            </>}
        </div>
    )
}

export default App
