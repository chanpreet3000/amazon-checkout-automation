import React, {useState, useContext} from "react";
import CheckoutProcessedData from "./CheckoutProcessedData";
import {AutomationContext} from "./automation_context/AutomationContext";
import ProcessUrlObjects from "./ProcessUrlObjects";

const Automation = () => {
  const {processedData, setProcessedData} = useContext(AutomationContext);
  const [status, setStatus] = useState(processedData !== null ? "PROCESSED" : "PROCESSING");


  const updateQuantity = (index, qtyValue) => {
    setProcessedData((prevResults) => {
      const newResults = {results: [...prevResults.results], error_results: [...prevResults.error_results]};
      newResults.results[index].quantity = qtyValue;
      return newResults;
    });
  }

  if (status === 'PROCESSING') {
    return <ProcessUrlObjects setStatus={setStatus}/>
  } else if (status === 'PROCESSED') {
    return <CheckoutProcessedData updateQuantity={updateQuantity}/>
  } else {
    return <div>An Error Occurred</div>
  }
}

export default Automation;