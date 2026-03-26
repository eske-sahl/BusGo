
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './Components/Login/Login';
import { Register } from './Components/Login/Register';
import {Home} from './Components/Home/Home';
import { About } from './Components/About/About';
import { UserDashboard } from './Components/UserDashboard/Dashboard';
import { OwnerDashboard } from './Components/OwnerDashboard/Dashboard';
import { DriverDashboard } from './Components/DriverDashboard/Dashboard';
import PublicLayout from "./Components/Layout/PublicLayout";

function App() {
  return (
    <>
      <div>
        <Router>
      <Routes>
        {/* PUBLIC PAGES (WITH NAVBAR) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/About" element={<About />} />
        </Route>
        {/* DASHBOARDS (NO NAVBAR) */}
        <Route path="/UserDashboard" element={<UserDashboard />} />
        <Route path="/OwnerDashboard" element={<OwnerDashboard />} />
        <Route path="/DriverDashboard" element={<DriverDashboard />} />
      </Routes>
      </Router>
        </div>
    </>
  )
}

export default App
