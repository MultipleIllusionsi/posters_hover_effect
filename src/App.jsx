import Gallery from "./components/Gallery";
import { galleries } from "./data/postersData";
import "./App.css";

export default function App() {
  return (
    <main className="page">
      {galleries.map((gallery) => (
        <Gallery
          key={gallery.id}
          title={gallery.title}
          horizontalPosters={gallery.horizontalPosters}
          verticalPosters={gallery.verticalPosters}
        />
      ))}
    </main>
  );
}
