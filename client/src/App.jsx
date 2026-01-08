import "./index.css";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

function App() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gray-100">
      {token ? <Dashboard /> : <Auth />}
    </div>
  );
}

export default App;
