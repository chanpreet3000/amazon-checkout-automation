import React from "react";

const Code = ({text}) => (
  <code className="px-2 py-1 rounded-md bg-gray-800 text-sm font-mono text-green-400">
    {text}
  </code>
);

const Step = ({number, title, children}) => (
  <section className="mb-6">
    <h2 className="text-lg font-medium text-blue-400 mb-2">Step {number}: {title}</h2>
    <div className="pl-4">{children}</div>
  </section>
);

const Alert = ({title, children}) => (
  <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-200 p-4 mb-6">
    <h3 className="font-bold">{title}</h3>
    <p>{children}</p>
  </div>
);

const HowToUse = ({setShowHowToUse}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 fade-in">
      <div
        className="w-[90%] max-w-4xl h-[90%] overflow-auto bg-gray-900 rounded-lg p-8 text-white shadow-xl custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-400">How to Use the Amazon Checkout Bot</h1>
          <button
            onClick={() => setShowHowToUse(false)}
            className="text-2xl hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </div>

        <Alert title="Important Note">
          Please read all instructions carefully before using the bot. Improper use may result in errors or unexpected
          behavior.
        </Alert>

        <div className="space-y-6">
          <Step number={1} title="Setting Up">
            <p>To start using the Amazon Checkout Bot, follow these steps:</p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
              <li>Ensure you have the latest version of the app.</li>
              <li>Run <Code text="yarn run setup"/> to install dependencies.</li>
              <li>Start the server by running <Code text="yarn run start"/>.</li>
            </ol>
          </Step>

          <Step number={2} title="Entering Product Information">
            <p>To add products for checkout:</p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
              <li>Enter the product URL in the designated field.</li>
              <li>Specify the desired quantity. If the quantity exceeds available stock, the maximum available will be
                selected.
              </li>
              <li>You can add any number of products. For multiple quantities of the same item, add the URL twice with
                different quantities.
              </li>
            </ol>
          </Step>

          <Step number={3} title="Starting the Checkout Process">
            <p>Once you've entered all product information:</p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
              <li>Double-check all entries for accuracy.</li>
              <li>Click the "Start Checkout" button to begin the process.</li>
              <li>The bot will automatically subscribe & checkout each item while bypassing prime interstitials &
                duplicate order page.
              </li>
            </ol>
          </Step>

          <Step number={4} title="Monitoring the Process">
            <p className="mb-2">During the checkout process and product scraping phase:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Keep the browser window open and active.</li>
              <li>Do not reload the page, as this will cause loss of progress.</li>
              <li>Monitor the command line where you ran <Code text="yarn run start"/> for any error messages or status
                updates.
              </li>
            </ul>
          </Step>

          <Step number={5} title="Handling Errors and Updates">
            <p className="mb-2">If you encounter issues or need to update:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>For errors, check the command line for detailed messages.</li>
              <li>To update the app, close the server, then run <Code text="yarn run setup"/> followed by <Code
                text="yarn run start"/>.
              </li>
            </ul>
          </Step>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;