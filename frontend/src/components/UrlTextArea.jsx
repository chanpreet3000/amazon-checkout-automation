import {useState} from "react";

const UrlTextArea = ({onCorrectInput}) => {
  const defaultTextAreaValue = `https://www.amazon.co.uk/dp/B0BMGR14DT?m=A3P5ROKL5A1OLE&ref=psp_pc_a_A3M5K1RZ4FGYO6&th=1 3
https://www.amazon.co.uk/dp/B09NQG6J5V?m=A3P5ROKL5A1OLE&ref=psp_pc_a_A3M5K1RZ4FGYO6&th=1 1
https://www.amazon.co.uk/dp/B0BM9NGP48?m=A3P5ROKL5A1OLE&ref=psp_pc_a_A3M5K1RZ4FGYO6&th=1 2`;


  const [textAreaValue, setTextAreaValue] = useState(defaultTextAreaValue);
  const [error, setError] = useState(null);

  const handleStartAutomation = () => {
    if (!textAreaValue.trim()) {
      setError('Please enter some valid data!');
      return;
    }

    const lines = textAreaValue.split("\n");
    const parsedUrls = [];
    let hasError = false;

    lines.forEach((line, index) => {
      const arr = line.trim().split(/\s+/);
      if (line.trim().split(/\s+/).length !== 2) {
        setError(`Invalid format at line ${index + 1}. Each line should contain a URL/ASIN followed by a space and then a quantity.`);
        hasError = true;
        return;
      }

      const [url, quantity] = arr;
      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity)) {
        setError(`Invalid quantity at line ${index + 1}. Quantity should be a number.`);
        hasError = true;
        return;
      }

      parsedUrls.push({url, quantity: parsedQuantity});
    });

    if (!hasError) {
      onCorrectInput(parsedUrls);
      setError(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-red-500 italic">
        * Make sure to enter the [URL/ASIN] [SPACE] [QUANTITY] and then press ENTER key before entering the next
        data.
      </div>
      <textarea
        onChange={(e) => setTextAreaValue(e.target.value)}
        value={textAreaValue}
        className="bg-[#252525FF] text-soft-white rounded p-2 h-[370px] text-sm w-full"
        placeholder={`Eg:\nhttps://amazon.co.uk/dp/B09NWDMFJK 2\nB0BMGR14DT 1`}
      />
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleStartAutomation}
          className="bg-soft-white text-deep-black py-2 px-8 rounded-xl font-semibold"
        >
          Start Automation
        </button>
      </div>
    </div>
  );
}

export default UrlTextArea;