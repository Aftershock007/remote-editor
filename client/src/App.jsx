import "./App.css"
import { Toaster } from "react-hot-toast"
import { Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import EditorPage from "./components/EditorPage"

export default function App() {
  return (
    <>
      <div>
        <Toaster position="top-center"></Toaster>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:roomId" element={<EditorPage />} />
      </Routes>
    </>
  )
}
