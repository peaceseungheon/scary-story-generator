import { Navigate, Route, Routes } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import StoryGeneratePage from "./pages/StoryGeneratePage";

const DEFAULT_PATH = "/generate";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={DEFAULT_PATH} replace />} />
      <Route path={DEFAULT_PATH} element={<StoryGeneratePage />} />
      <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
    </Routes>
  );
}
