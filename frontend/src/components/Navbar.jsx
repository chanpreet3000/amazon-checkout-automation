import {Link} from "react-router-dom";
import React, {useContext, useState} from "react";
import HowToUse from "./HowToUse";
import {AccountContext} from "./account/AccountProvider";
import {BiHome} from "react-icons/bi";

const Navbar = () => {
  const [showHowToUse, setShowHowToUse] = useState(false);
  const {currentAccount} = useContext(AccountContext);

  return (
    <>
      {showHowToUse && <HowToUse setShowHowToUse={setShowHowToUse}/>}
      <div className="w-full flex flex-row justify-between items-start p-4">
        <Link to="/">
          <div className="text-soft-white text-xl font-bold items-center flex flex-row gap-1">
            <BiHome size={24}/>
            <div>Amazon Checkout Automation</div>
          </div>
        </Link>
        <div className="flex gap-4 items-start">
          <div className="flex flex-col gap-1 items-center">
            <Link to="/login">
              <button
                className="bg-soft-white text-deep-black text-sm font-semibold py-2 px-4 rounded-xl flex flex-col gap-1 items-center">
                <div>Switch Account</div>
              </button>
            </Link>
            <div className="text-soft-white text-xs">({currentAccount})</div>
          </div>
          <button className="bg-vibrant-orange text-soft-white text-sm font-semibold py-2 px-6 rounded-xl"
                  onClick={() => setShowHowToUse(true)}>How To Use
          </button>
          <button className="bg-soft-white text-deep-black text-sm font-semibold py-2 px-6 rounded-xl ">
            <Link to="https://chanpreet-portfolio.vercel.app/#connect" target="_blank">
              Contact Developer
            </Link>
          </button>
        </div>
      </div>
    </>
  )
}

export default Navbar;