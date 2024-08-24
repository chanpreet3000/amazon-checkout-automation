import {Link, Route, Routes} from "react-router-dom";
import React from "react";
import Home from "./Home";
const Navbar = () => {
  return (
    <div className="w-full flex flex-row justify-between items-center">
      <Link to="/">
        <div className="text-soft-white text-2xl font-bold">Amazon Checkout Automation</div>
      </Link>
      <Link to="https://chanpreet-portfolio.vercel.app/#connect" target="_blank">
        <button className="bg-soft-white text-deep-black text-sm font-semibold py-2 px-8 rounded-xl ">Contact
          Developer
        </button>
      </Link>
    </div>
  )
}


function App() {
  return (
    <div className="min-h-[100vh] w-full bg-deep-black">
      <div className="px-12 pt-6 pb-10">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}/>
        </Routes>
      </div>
    </div>
  )
}

export default App;
