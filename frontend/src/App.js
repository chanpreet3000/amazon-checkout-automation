import {Link, Route, Routes} from "react-router-dom";
import React from "react";
import Home from "./Home";

const Navbar = () => {
  return (
    <div className="w-full flex flex-row justify-between items-center">
      <Link to="/">
        <div className="text-soft-white text-2xl font-bold">Amazon Checkout Automation</div>
      </Link>
      <div className="flex gap-4 s">
        <div className="flex flex-col gap-2 w-[200px]">
          <button className="bg-vibrant-orange text-soft-white text-sm font-semibold py-2 px-8 rounded-xl ">Sign In to
            Amazon
          </button>
          <div className="text-red-500 text-[12px]">
            * Sign in if you have logged out or not logged in.
          </div>
        </div>
        <Link to="https://chanpreet-portfolio.vercel.app/#connect" target="_blank">
          <button className="bg-soft-white text-deep-black text-sm font-semibold py-2 px-8 rounded-xl ">Contact
            Developer
          </button>
        </Link>
      </div>
    </div>
  )
}


function App() {
  return (
    <div className="min-h-[100vh] w-full bg-deep-black">
      <div className="px-12 pt-6 pb-10">
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App;
