import React, {useState, useContext} from "react";
import GroupCards from "./GroupCards";
import {AutomationContext} from "./automation_context/AutomationContext";
import ProcessUrlObjects from "./ProcessUrlObjects";

const Automation = () => {
  const {processedData, setProcessedData} = useContext(AutomationContext);
  const [status, setStatus] = useState(processedData !== null ? "PROCESSED" : "PROCESSING");


  const updateQuantity = (index1, index2, qtyValue) => {
    setProcessedData((prevResults) => {
      const newResults = {results: [...prevResults.results], error_results: [...prevResults.error_results]};
      newResults.results[index1][index2].quantity = qtyValue;
      return newResults;
    });
  }

  if (status === 'PROCESSING') {
    return <ProcessUrlObjects setStatus={setStatus}/>
  } else if (status === 'PROCESSED') {
    return <GroupCards updateQuantity={updateQuantity}/>
  } else {
    return <div>An Error Occurred</div>
  }
}

export default Automation;