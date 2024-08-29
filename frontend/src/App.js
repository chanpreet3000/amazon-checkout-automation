import {Route, Routes} from "react-router-dom";
import React, {useEffect} from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import {AutomationContextProvider} from "./components/automation/automation_context/AutomationContext";
import AccountProvider from "./components/account/AccountProvider";
import Login from "./components/Login/Login";

function App() {
  useEffect(() => {
    document.title = 'Amazon Checkout Automation'
  })

  return (
    <AccountProvider>
      <AutomationContextProvider>
        <div className="min-h-[100vh] w-full bg-deep-black">
          <div className="px-12 pt-6 pb-10">
            <Navbar/>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/login" element={<Login/>}/>
            </Routes>
          </div>
        </div>
      </AutomationContextProvider>
    </AccountProvider>
  )
}

export default App;
