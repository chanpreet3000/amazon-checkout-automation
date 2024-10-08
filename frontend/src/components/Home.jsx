import {useContext, useEffect, useState} from "react";
import UrlTextArea from "./UrlTextArea";
import Automation from "./automation/Automation";
import {AutomationContext} from "./automation/automation_context/AutomationContext";
import {AccountContext} from "./account/AccountProvider";
import {useNavigate} from "react-router-dom";
import {MdDeleteForever} from "react-icons/md";

const Home = () => {
  const {inputUrlObjects, setInputUrlObjects, resetToDefault} = useContext(AutomationContext);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const {currentAccount} = useContext(AccountContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentAccount === null) {
      navigate('/switch-account');
    }
  }, [currentAccount, navigate]);

  const onCorrectInput = (urls) => {
    setInputUrlObjects(urls);
  }

  const handleReset = () => {
    setShowConfirmDialog(true);
  }

  const confirmReset = () => {
    resetToDefault();
    setShowConfirmDialog(false);
  }

  const cancelReset = () => {
    setShowConfirmDialog(false);
  }

  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center fade-in">
      <div className="bg-deep-black p-6 rounded-xl">
        <p className="mb-4">Are you sure you want to reset? This will clear all entered items.</p>
        <div className="flex justify-end gap-4">
          <button
            className="bg-red-500 text-soft-white px-4 py-2 rounded-xl"
            onClick={confirmReset}
          >
            Confirm
          </button>
          <button
            className="bg-gray-500 text-soft-white px-4 py-2 rounded-xl"
            onClick={cancelReset}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="text-soft-white mt-8">
      {inputUrlObjects.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div>
              <button
                className="text-soft-white bg-red-600 font-semibold text-base rounded-xl px-4 py-3 flex items-center"
                onClick={handleReset}
              >
                <MdDeleteForever size={20}/>
                <div>Reset Checkout Items</div>
              </button>
            </div>
          </div>
          <Automation/>
        </div>
      ) : (
        <UrlTextArea onCorrectInput={onCorrectInput}/>
      )}
      {showConfirmDialog && <ConfirmDialog/>}
    </div>
  );
};

export default Home;