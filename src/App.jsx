import "./App.scss";
import { Header } from "./components/Header/Header.jsx";
import {
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { Staking } from "./pages/Staking/Staking.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Unpacker } from "./pages/Unpacker/Unpacker.jsx";
import { useEffect, useState } from "react";
import { Marketplace } from "./pages/Marketplace/Marketplace.jsx";


export const  App = () =>  {
  const [location, setLocation] = useState();
  return (
    <div className={`app ${location !== "/unpacker" ? "main" : ""}`}>
      <Router>
        <Main setLocation={setLocation} />
      </Router>
    </div>
  );
}

const Main = ({ setLocation }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    setLocation(pathname);
  }, [pathname]);

  return (
    <Routes>
      <Route
        element={
          <>
            <Header />
            <Outlet />
            <ToastContainer />
          </>
        }
      >
        <Route path="staking" index element={<Staking />} />
        <Route path="unpacker" element={<Unpacker />} />
        <Route path="market" element={<Marketplace />} />
        <Route path="*" element={<Navigate to="/staking" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
