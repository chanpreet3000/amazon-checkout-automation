import React, {useEffect, useState, useRef} from "react";
import GroupCards from "./GroupCards";

const Automation = ({urls}) => {
  const [status, setStatus] = useState("PROCESSING");
  const [error, setError] = useState(null);
  const [processedItems, setProcessedItems] = useState(0);
  const [results, setResults] = useState(null);
  const [errorResults, setErrorResults] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/batch_process_products');

    ws.current.onopen = () => {
      const products = urls.map(urlObj => ({
        url_or_asin: urlObj.url,
        quantity: urlObj.quantity.toString()
      }));

      ws.current.send(JSON.stringify({products: products}));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if ('processed' in message) {
        setStatus(`PROCESSING`);
        setProcessedItems(message.processed);
      } else if ('results' in message) {
        setStatus("PROCESSED");
        setResults(message.results);
        setErrorResults(message.error_results);
      } else {
        setStatus("ERROR");
        setError(message.error);
      }
    };

    ws.current.onerror = (error) => {
      setError(error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [urls]);

  const updateQuantity = (index1, index2, qtyValue) => {
    setResults((prevResults) => {
      const newResults = [...prevResults];
      newResults[index1][index2].quantity = qtyValue;
      return newResults;
    });
  }

  if (status === 'PROCESSING') {
    return (
      <div className="flex justify-center items-center pt-32">
        <div className="flex flex-col gap-4 items-center">
          <div>Products Processed...</div>
          <div className="flex flex-row gap-2 items-center">
            <div className="w-[200px] h-[6px] bg-[#323232FF] rounded-xl relative overflow-hidden">
              <div className="absolute top-0 bottom-0 bg-white transition-all duration-500"
                   style={{
                     width: `${((processedItems) / urls.length) * 100}%`
                   }}
              ></div>
            </div>
            <div className="text-sm">{`${(processedItems)}/${urls.length}`}</div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'PROCESSED') {
    return (
      <GroupCards results={results} errorResults={errorResults} updateQuantity={updateQuantity}/>
    );
  }

  return (
    <div>An Error Occurred:- {error}</div>
  );
}

export default Automation;