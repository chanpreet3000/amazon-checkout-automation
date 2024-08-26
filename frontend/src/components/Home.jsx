import {useState} from "react";
import UrlTextArea from "./UrlTextArea";
import Automation from "./automation/Automation";

const Home = () => {
  const [isInputEntered, setIsInputEntered] = useState(false);
  const [urlsData, setUrlsData] = useState([]);

  const onCorrectInput = (urls) => {
    setUrlsData(urls);
    setIsInputEntered(true);
  }

  return (
    <div className="text-soft-white mt-8">
      <div className="text-sm text-red-500 italic">
        * Reloading the page will start everything over.
      </div>
      {!isInputEntered ? (
        <UrlTextArea onCorrectInput={onCorrectInput}/>
      ) : (
        <Automation urls={urlsData}/>
      )}
    </div>
  );
};

export default Home;