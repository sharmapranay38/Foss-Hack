import {Route, Routes} from "react-router-dom"
import Intro from "./pages/Intro"
import Join from "./pages/Join"
import Room from "./pages/Room"
import "./App.css"
function App() {
  return (
    <>
      <Routes>
      <Route path="/" index element={<Intro />} />
      <Route path="/join-room" index element={<Join />} />
      <Route path="/room" index element={<Room />} />
      </Routes>
    </>
  )
}

export default App
