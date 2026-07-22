import { useState } from "react";
import Gallery from "./components/Gallery";
import HoverModeToggle from "./components/HoverModeToggle";
import { galleries } from "./data/postersData";
import "./App.css";

export default function App() {
  // Which hover treatment the vertical posters use: "v1" (poster is replaced by
  // a card) or "v2" (actions + description rise from the bottom).
  const [hoverMode, setHoverMode] = useState("v1");

  return (
    <main className="page">
      {galleries.map((gallery) => (
        <Gallery
          key={gallery.id}
          title={gallery.title}
          horizontalPosters={gallery.horizontalPosters}
          verticalPosters={gallery.verticalPosters}
          verticalHover={hoverMode}
        />
      ))}

      <HoverModeToggle mode={hoverMode} onChange={setHoverMode} />
    </main>
  );
}
