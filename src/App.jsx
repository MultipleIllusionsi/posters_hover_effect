import { useState } from "react";
import Gallery from "./components/Gallery";
import ModeToggle from "./components/ModeToggle";
import { galleries } from "./data/postersData";
import "./App.css";

export default function App() {
  // Какой вариант взаимодействия показываем: "hover" (Ховер), "sheet" (Шторка)
  // или "combined" (Совмещённый).
  const [mode, setMode] = useState("hover");

  return (
    <main className="page">
      {galleries.map((gallery) => (
        <Gallery
          key={gallery.id}
          title={gallery.title}
          horizontalPosters={gallery.horizontalPosters}
          verticalPosters={gallery.verticalPosters}
          mode={mode}
        />
      ))}

      <ModeToggle mode={mode} onChange={setMode} />
    </main>
  );
}
