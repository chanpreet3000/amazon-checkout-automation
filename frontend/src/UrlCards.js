import {useEffect, useState} from "react";
import React from "react";
import {ImSpinner8} from "react-icons/im";
import {axiosApi} from "./axios";
import {Link} from "react-router-dom";

const ProcessedUrlCard = ({index, item}) => {
  const [qtyValue, setQtyValue] = useState(item.defaultQuantity.toString());
  const [frequencyValue, setFrequencyValue] = useState(item.frequency_options[0]?.value);

  return (
    <div className="bg-[#212121ff] min-h-12 rounded-xl text-base flex justify-between gap-12 items-center p-4 px-8">
      <div className="flex gap-4 items-center">
        <div className="grow-0 shrink-0 w-[75px] h-[75px] overflow-hidden rounded-full">
          <img src={item.img_url} className="w-full h-full object-cover" alt={item.title}/>
        </div>
        <div className="flex flex-col gap-2">
          <Link className="text-blue-300 line-clamp-2" target="_blank" to={item.url}>{item.title}</Link>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 items-center">
              <label htmlFor={`quantity-${index}`} className="text-soft-white">Qty:</label>
              <select
                id={`quantity-${index}`}
                className="bg-[#323232ff] rounded text-soft-white px-2 py-1"
                defaultValue={qtyValue}
                onChange={(e) => setQtyValue(e.target.value)}
              >
                {item.quantity_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor={`frequency-${index}`} className="text-soft-white">Frequency:</label>
              <select
                id={`frequency-${index}`}
                className="bg-[#323232ff] rounded text-soft-white px-2 py-1"
                defaultValue={frequencyValue}
                onChange={(e) => setFrequencyValue(e.target.value)}
              >
                {item.frequency_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <button className="bg-soft-white text-deep-black text-base font-semibold py-2 px-8 rounded-xl">Checkout</button>
    </div>
  )
}

const ErrorUrlCard = ({item}) => {
  return (
    <div
      className="bg-crimson-red text-soft-white min-h-12 rounded-xl text-base flex justify-between gap-12 items-center p-4 px-8">
      <div className="flex gap-4 items-center">
        <div className="grow-0 shrink-0 w-[75px] h-[75px] overflow-hidden rounded-full">
          <img src={item.img_url} className="w-full h-full object-cover" alt={item.title}/>
        </div>
        <div className="flex flex-col gap-2">
          <Link className="text-blue-300 line-clamp-2" target="_blank" to={item.url}>{item.title}</Link>
          <div>
            {`An Error Occurred:- ${item.error}`}
          </div>
        </div>
      </div>
    </div>
  )
}

const UrlCard = ({item}) => {
  if (item.status === 'PROCESSED') {
    return <ProcessedUrlCard item={item}/>;
  } else if (item.status === 'ERROR') {
    return <ErrorUrlCard item={item}/>;
  }
  return (
    <div className="bg-[#212121ff] min-h-12 rounded-xl flex justify-center items-center">
      Unknown State
    </div>
  );
};

const UrlCards = ({urls}) => {
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
};

export default UrlCards;