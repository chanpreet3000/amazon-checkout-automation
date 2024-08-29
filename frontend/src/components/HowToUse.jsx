import React from "react";
import {IoClose} from "react-icons/io5";

const Code = ({text}) => {
  return (
    <code className="px-2 py-1 rounded-md bg-gray-800 text-sm font-mono text-green-400">
      {text}
    </code>
  );
};

const HowToUse = ({setShowHowToUse}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 fade-in">
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
            <h2 className="text-lg font-medium">Step 1: Error Handling</h2>
            <p className="pl-4 mt-2">
              For any errors encountered, check the command line where you ran <Code text="yarn run start"/>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-green-400">Step 2: Reloading</h2>
            <p className="pl-4 mt-2">
              Reloading the page won't cause any loss of progress.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium">Step 3: Entering URL and Quantity</h2>
            <p className="pl-4 mt-2">
              Enter any quantity you wish. The bot will automatically split it into different carts if needed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium">Step 4: Updating the App</h2>
            <p className="pl-4 mt-2">
              To update the app to the latest code, run <Code text="yarn run setup"/> followed by <Code
              text="yarn run start"/> to restart the server.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium">Step 5: Checkout Process</h2>
            <p className="pl-4 mt-2">
              You will need to individually check out each shopping cart.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-red-500">Step 6: Payment Process</h2>
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
