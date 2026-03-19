import "./index.css";
import BirthdayPlayer from "./components/BirthdayPlayer";

export default function App() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <BirthdayPlayer />
    </div>
  );
}
