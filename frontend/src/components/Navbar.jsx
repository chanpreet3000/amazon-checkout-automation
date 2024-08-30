import {Link} from "react-router-dom";
import React, {useContext, useState} from "react";
import HowToUse from "./HowToUse";
import {AccountContext} from "./account/AccountProvider";
import {BiHome} from "react-icons/bi";
import {MdOutlineSwitchAccount} from "react-icons/md";
import {IoMdInformationCircleOutline} from "react-icons/io";
import {IoMdContacts} from "react-icons/io";

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
            <Link to="/switch-account">
              <button
                className="bg-soft-white text-deep-black text-sm font-semibold py-3 px-4 rounded-xl flex gap-1 items-center">
                <MdOutlineSwitchAccount size={18}/>
                <div>Switch Account</div>
              </button>
            </Link>
            <div className="text-soft-white text-xs">({currentAccount})</div>
          </div>
          <button
            className="bg-vibrant-orange text-soft-white text-sm font-semibold py-3 px-4 rounded-xl flex gap-1 items-center"
            onClick={() => setShowHowToUse(true)}>
            <IoMdInformationCircleOutline size={18}/>
            <div>How To Use</div>
          </button>
          <Link to="https://chanpreet-portfolio.vercel.app/#connect" target="_blank">
            <button className="bg-soft-white text-deep-black text-sm font-semibold py-3 px-4 rounded-xl flex gap-1 items-center">
              <IoMdContacts size={18}/>
              <div>Contact Developer</div>
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Navbar;