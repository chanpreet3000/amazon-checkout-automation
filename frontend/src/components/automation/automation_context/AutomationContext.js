import React, {createContext, useEffect, useState} from 'react';

export const AutomationContext = createContext();

export function AutomationContextProvider({children}) {
  let localProcessedData = localStorage.getItem('processedData') ?? JSON.stringify(null);
  localProcessedData = JSON.parse(localProcessedData);

  let localInputUrlObjects = localStorage.getItem('inputUrlObjects') ?? JSON.stringify([]);
  localInputUrlObjects = JSON.parse(localInputUrlObjects);

   const [processedData, setProcessedData] = useState(localProcessedData);
  const [inputUrlObjects, setInputUrlObjects] = useState(localInputUrlObjects);

  const resetToDefault = () => {
    setProcessedData(null);
    setInputUrlObjects([]);
  }

  useEffect(() => {
    localStorage.setItem('processedData', JSON.stringify(processedData));
  }, [processedData]);

  useEffect(() => {
    localStorage.setItem('inputUrlObjects', JSON.stringify(inputUrlObjects));
  }, [inputUrlObjects]);

  const value = {
    processedData,
    setProcessedData,
    inputUrlObjects,
    setInputUrlObjects,
    resetToDefault
  };

  return (
    <AutomationContext.Provider value={value}>
      {children}
    </AutomationContext.Provider>
  );
}