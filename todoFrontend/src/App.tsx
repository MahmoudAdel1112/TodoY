import { Outlet } from "react-router-dom";
import AppRoutes from "../routes";

function App() {
  return (
    <div className="App">
      <Outlet />
      <AppRoutes />
    </div>
  );
}

export default App;
