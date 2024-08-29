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
      <div className="w-full flex flex-row justify-between items-center">
        <Link to="/">
          <div className="text-soft-white text-lg font-bold items-center flex flex-row gap-1">
            <BiHome size={24}/>
            <div>Amazon Checkout Automation</div>
          </div>
        </Link>
        <div className="flex gap-4">
          <div>
            <Link to="/login">
              <button
                className="bg-soft-white text-deep-black text-sm font-semibold py-2 px-4 rounded-xl flex flex-col gap-1 items-center">
                <div>Switch Account</div>
                <div className="text-xs">({currentAccount})</div>
              </button>
            </Link>
          </div>
          <button className="bg-vibrant-orange text-soft-white text-sm font-semibold py-2 px-8 rounded-xl"
                  onClick={() => setShowHowToUse(true)}>How To Use
          </button>
          <button className="bg-soft-white text-deep-black text-sm font-semibold py-2 px-8 rounded-xl ">
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