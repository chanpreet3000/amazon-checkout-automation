import React, {useState} from "react";
import {IoClose} from "react-icons/io5";
import {axiosApi} from "../axios";
import {CgSpinner} from "react-icons/cg";

const Code = ({text}) => {
  return (
    <code className="px-2 py-1 rounded-md bg-gray-800 text-sm font-mono text-green-400">
      {text}
    </code>
  );
};

const HowToUse = ({setShowHowToUse}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const handleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    await axiosApi.get('/open_amazon_signin')
      .then((response) => {
        alert(response.data.message);
      }).catch((error) => {
        alert("Error occurred during sign-in. Please try again.");
      }).finally(() => {
        setIsSigningIn(false);
      })
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="w-[80%] h-[80%] overflow-auto bg-deep-black rounded-lg p-8 text-white">
        <div className="flex justify-end">
          <IoClose
            className="cursor-pointer text-xl hover:text-red-500 transition-colors"
            onClick={() => setShowHowToUse(false)}
          />
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="text-xl font-semibold">How to Use the Amazon Checkout Bot</h1>

          <section>
            <h2 className="text-lg font-medium">Step 1: Sign In to Amazon</h2>
            <div className="pl-4 mt-2 flex flex-col gap-2">
              <p className="text-green-400 text-xs mt-1">
                You only have 10 minutes to login. Make sure to accept the cookies and after login close the window.
              </p>
              <button
                className="hover:bg-orange-600 text-white text-sm font-semibold py-2 px-6 rounded-xl w-max transition-colors"
                style={{
                  backgroundColor: isSigningIn ? '#2a2a27' : '#ff9900',
                }}
                onClick={handleSignIn}
              >
                {isSigningIn ? <CgSpinner className="text-white animate-spin" size={32}/> : 'Sign In to Amazon'}
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium">Step 2: Error Handling</h2>
            <p className="pl-4 mt-2">
              For any errors encountered, check the command line where you ran <Code text="yarn run start"/>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-green-400">Step 3: Reloading</h2>
            <p className="pl-4 mt-2">
              Reloading the page won't cause any loss of progress.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium">Step 4: Entering URL and Quantity</h2>
            <p className="pl-4 mt-2">
              Enter any quantity you wish. The bot will automatically split it into different carts if needed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium">Step 5: Updating the App</h2>
            <p className="pl-4 mt-2">
              To update the app to the latest code, run <Code text="yarn run setup"/> followed by <Code
              text="yarn run start"/> to restart the server.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium">Step 6: Checkout Process</h2>
            <p className="pl-4 mt-2">
              You will need to individually check out each shopping cart.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-red-500">Step 7: Payment Process</h2>
            <p className="pl-4 mt-2">
              After checkout, you have 20 minutes to complete the payment. <strong>Close the window after paying before
              moving on to the next checkout.</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;
