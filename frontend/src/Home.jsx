import {useState} from "react";
import UrlCards from "./UrlCards";

const Home = () => {
  const [textAreaValue, setTextAreaValue] = useState(`https://www.amazon.co.uk/dp/B0BMGR14DT?m=A3P5ROKL5A1OLE&ref=psp_pc_a_A3M5K1RZ4FGYO6&th=1
https://www.amazon.co.uk/dp/B09NQG6J5V?m=A3P5ROKL5A1OLE&ref=psp_pc_a_A3M5K1RZ4FGYO6&th=1
https://www.amazon.co.uk/dp/B0BM9NGP48?m=A3P5ROKL5A1OLE&ref=psp_pc_a_A3M5K1RZ4FGYO6&th=1`);
  const [urls, setUrls] = useState([]);
  const [isInputEntered, setIsInputEntered] = useState(false);

  const handleStartAutomation = () => {
    if (!textAreaValue) {
      alert('Please enter some valid data!');
    } else {
      setIsInputEntered(true);
      const urls = textAreaValue.split("\n");
      setUrls(urls);
    }
  }

  return (
    <div className="text-soft-white mt-16">
      {!isInputEntered ?
        <div className="flex flex-col gap-4">
          <div className="text-sm text-red-500 italic">
            * Make sure to enter the URL/ASIN and then press ENTER key before entering the next data.
          </div>
          <textarea onChange={(e) => setTextAreaValue(e.target.value)} value={textAreaValue}
                    className="text-deep-black bg-soft-white rounded p-2 h-[400px] w-full"
                    placeholder={`Eg:\nhttps://amazon.co.uk/dp/B09NWDMFJK\nB09NWDMFJK`}/>
          <div className="flex justify-center mt-8">
            <button onClick={handleStartAutomation}
                    className="bg-soft-white text-deep-black py-2 px-8 rounded-xl font-semibold ">
              Start Automation
            </button>
          </div>
        </div>
        :
        <UrlCards urls={urls}/>
      }
    </div>
  )
}
export default Home;