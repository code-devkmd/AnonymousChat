import { BrowserRouter, Routes, Route } from "react-router-dom"

import CreateRoom from "./pages/CreatePage";
import ChatPage from "./pages/ChatPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="" element={<CreateRoom />} />
                <Route path="/room/:roomId" element={<ChatPage />} />
            </Routes>
        </BrowserRouter>
    );
}