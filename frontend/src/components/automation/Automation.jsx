import React, {useEffect, useState} from "react";
import {axiosApi} from "../../axios";
import {ImSpinner8} from "react-icons/im";
import UrlCard from "./UrlCard";

const Automation = ({urls}) => {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      for (const urlObj of urls) {
        const response = await axiosApi.post('/process_url', {url: urlObj.url});
        const processedData = response.data;
        if (processedData.status === 'ERROR') {
          setData((prevData) => {
            const newData = [...prevData];
            newData.push({...processedData});
            return newData;
          })
          continue;
        }

        const maxQuantity = processedData.quantity_options && processedData.quantity_options.length > 0
          ? Math.max(...processedData.quantity_options.map(option => parseInt(option.value)))
          : 1;

        // Calculate how many objects we need to create
        const fullObjects = Math.floor(urlObj.quantity / maxQuantity);
        const remainder = urlObj.quantity % maxQuantity;

        setData((prevData) => {
          const newData = [...prevData];
          // Create full quantity objects
          for (let i = 0; i < fullObjects; i++) {
            newData.push({...processedData, defaultQuantity: maxQuantity});
          }

          // Create remainder object if needed
          if (remainder > 0) {
            newData.push({...processedData, defaultQuantity: remainder});
          }
          return newData;
        })

      }
      setIsFetching(false);
    };

    fetchData();
  }, [urls]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-red-500 text-sm">
        * Loading might take a few seconds. Please wait for the data to load.
      </div>
      <div className="flex flex-col gap-4">
        {data.map((item, index) => (
          <UrlCard key={index} item={item}/>
        ))}
        {isFetching && (
          <div className="bg-[#212121ff] min-h-12 rounded-xl flex justify-center items-center">
            <ImSpinner8 className="text-soft-white animate-spin"/>
          </div>
        )}
      </div>
    </div>
  );
}
export default Automation;