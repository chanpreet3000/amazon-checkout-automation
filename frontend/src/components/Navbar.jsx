import {axiosApi} from "../axios";
import {Link} from "react-router-dom";
import React from "react";

const Navbar = () => {
  const handleSignIn = async () => {
    await axiosApi.get('/open_amazon_signin');
    alert('Please sign in to Amazon in the google chrome that opened.');
  }

  return (
    <div className="w-full flex flex-row justify-between items-center">
      <Link to="/">
        <div className="text-soft-white text-2xl font-bold">Amazon Checkout Automation</div>
      </Link>
      <div className="flex gap-4 s">
        <div className="flex flex-col gap-2 w-[200px]">
          <button className="bg-vibrant-orange text-soft-white text-sm font-semibold py-2 px-8 rounded-xl"
                  onClick={handleSignIn}>Sign In to
            Amazon
          </button>
          <div className="text-red-500 text-[12px]">
            * Sign in if you have not logged in. Also make sure to accept cookies.
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

export default Navbar;