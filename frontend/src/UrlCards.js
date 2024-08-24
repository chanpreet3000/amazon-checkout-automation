import {useEffect, useState} from "react";
import React from "react";
import {ImSpinner8} from "react-icons/im";
import {axiosApi} from "./axios";
import {Link} from "react-router-dom";


const PendingUrlCard = ({index, item, handleUpdate}) => {
  useEffect(() => {
    const fetchData = async () => {
      await axiosApi.post('/process_url', {url: item.url})
        .then((response) => {
          const data = response.data;
          handleUpdate(index, data);
        });
    }

    fetchData();
  }, []);

  return (
    <div key={index}
         className="bg-[#212121ff] min-h-12 rounded-xl flex justify-center items-center">
      <ImSpinner8 className="text-soft-white animate-spin"/>
    </div>
  )
}

const ProcessedUrlCard = ({index, item, handleUpdate}) => {
  const [qtyValue, setQtyValue] = useState(item.quantity_options[0]?.value);
  const [frequencyValue, setFrequencyValue] = useState(item.frequency_options[0]?.value);

  return (
    <div key={index}
         className="bg-[#212121ff] min-h-12 rounded-xl text-base flex justify-between gap-12 items-center p-4 px-8">
      <div className="flex gap-4 items-center">
        <img src={item.img_url} className="w-[75px] h-[75px] rounded-full object-cover" alt={item.title}/>
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

const UrlCard = ({index, item, handleUpdate}) => {
  const key = `${item.status}-${index}`;
  if (item.status === 'PENDING') {
    return <PendingUrlCard key={key} handleUpdate={handleUpdate} item={item} index={index}/>
  } else if (item.status === 'PROCESSED') {
    return <ProcessedUrlCard key={key} handleUpdate={handleUpdate} item={item} index={index}/>
  }
  return (
    <div key={index}
         className="bg-[#212121ff] min-h-12 rounded-xl flex justify-center items-center">
      Unknown State
    </div>
  )
}
const UrlCards = ({urls}) => {
  const initialData = urls.map((url) => {
    return {
      url: url, status: 'PENDING',
    }
  })

  const [data, setData] = useState(initialData);

  const updateDataAtIndex = (index, newData) => {
    setData((data) => {
      const updatedData = [...data];
      updatedData[index] = newData;
      return updatedData;
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-red-500 text-sm">
        * Loading might take a few seconds. Please wait for the data to load.
      </div>
      <div className="flex flex-col gap-4">
        {data.map((item, index) => <UrlCard index={index} item={item} handleUpdate={updateDataAtIndex}/>)}
        <h1>{JSON.stringify(data)}</h1>
      </div>
    </div>
  );
}

export default UrlCards;