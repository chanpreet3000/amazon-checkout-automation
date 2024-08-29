import React, {useContext, useEffect, useRef, useState} from "react";
import {AutomationContext} from "./automation_context/AutomationContext";
import {AccountContext} from "../account/AccountProvider";

const ProcessUrlObjects = ({setStatus,}) => {
  const {setProcessedData, inputUrlObjects} = useContext(AutomationContext);

  const [processedItems, setProcessedItems] = useState(0);
  const {currentAccount} = useContext(AccountContext);
  const ws = useRef(null);


  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/batch_process_products');

    ws.current.onopen = () => {
      const products = inputUrlObjects.map(urlObj => ({
        url_or_asin: urlObj.url,
        quantity: urlObj.quantity.toString()
      }));

      ws.current.send(JSON.stringify({products: products, email: currentAccount}));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if ('processed' in message) {
        setStatus(`PROCESSING`);
        setProcessedItems(message.processed);
      } else if ('results' in message) {
        setStatus("PROCESSED");
        setProcessedData(message);
      } else {
        setStatus("ERROR");
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [inputUrlObjects]);

  return (
    <div className="flex justify-center items-center pt-32">
      <div className="flex flex-col gap-4 items-center">
        <div>Products Processed...</div>
        <div className="flex flex-row gap-2 items-center">
          <div className="w-[200px] h-[6px] bg-[#323232FF] rounded-xl relative overflow-hidden">
            <div className="absolute top-0 bottom-0 bg-white transition-all duration-500"
                 style={{
                   width: `${((processedItems) / inputUrlObjects.length) * 100}%`
                 }}
            ></div>
          </div>
          <div className="text-sm">{`${(processedItems)}/${inputUrlObjects.length}`}</div>
        </div>
      </div>
    </div>
  )
}

export default ProcessUrlObjects;