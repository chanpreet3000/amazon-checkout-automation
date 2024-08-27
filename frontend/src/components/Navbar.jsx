import {axiosApi} from "../axios";
import {Link} from "react-router-dom";
import React, {useState} from "react";
import HowToUse from "./HowToUse";

const Navbar = () => {
  const [showHowToUse, setShowHowToUse] = useState(false);

  return (
    <>
      {showHowToUse && <HowToUse setShowHowToUse={setShowHowToUse}/>}
      <div className="w-full flex flex-row justify-between items-center">
        <Link to="/">
          <div className="text-soft-white text-2xl font-bold">Amazon Checkout Automation</div>
        </Link>
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            <button className="bg-vibrant-orange text-soft-white text-sm font-semibold py-2 px-8 rounded-xl"
                    onClick={() => setShowHowToUse(true)}>How To Use
            </button>

          </div>
          <Link to="https://chanpreet-portfolio.vercel.app/#connect" target="_blank">
            <button className="bg-soft-white text-deep-black text-sm font-semibold py-2 px-8 rounded-xl ">Contact
              Developer
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Navbar;