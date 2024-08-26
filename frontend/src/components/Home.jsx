import {useContext, useState} from "react";
import UrlTextArea from "./UrlTextArea";
import Automation from "./automation/Automation";
import {AutomationContext} from "./automation/automation_context/AutomationContext";

const Home = () => {
  const {inputUrlObjects, setInputUrlObjects, resetToDefault} = useContext(AutomationContext);

  const onCorrectInput = (urls) => {
    setInputUrlObjects(urls);
  }

  return (
    <div className="text-soft-white mt-8">
      {inputUrlObjects.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div>
              <button className="bg-soft-white text-deep-black rounded-xl px-6 py-2"
                      onClick={() => resetToDefault()}>Reset Items
              </button>
            </div>
            <div className="text-sm text-red-500 italic">
              Resetting will clear all the items you have entered (without any warning). You can start again by entering the items.
            </div>
          </div>
          <Automation/>
        </div>
      ) : (
        <UrlTextArea onCorrectInput={onCorrectInput}/>
      )}
    </div>
  );
};

export default Home;