// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import FolderView from "./components/FolderView";
import CardView from "./components/CardView"; // ← 追加

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/folders/:id" element={<FolderView />} />
        <Route path="/cards/:id" element={<CardView />} /> {/* ← 追加 */}
      </Routes>
    </Router>
  );
}

export default App;
