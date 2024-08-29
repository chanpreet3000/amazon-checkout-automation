import React, {useContext, useState} from "react";
import {Link} from "react-router-dom";
import {axiosApi} from "../../axios";
import {AutomationContext} from "./automation_context/AutomationContext";
import {FaCheck} from "react-icons/fa";
import {CgSpinner} from "react-icons/cg";
import {AccountContext} from "../account/AccountProvider";

export const ErrorItem = ({item}) => {
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


const GroupItem = ({index1, index2, item, updateQuantity}) => {
  const [qtyValue, setQtyValue] = useState(item.quantity.toString());

  const onQuantityChange = (e) => {
    setQtyValue(e.target.value)
    updateQuantity(index1, index2, e.target.value)
  }

  return (
    <div className="min-h-12 text-base flex gap-4 items-center">
      <div className="grow-0 shrink-0 w-[50px] h-[50px] overflow-hidden rounded-full">
        <img src={item.img_url} className="w-full h-full object-cover" alt={item.title}/>
      </div>
      <div className="flex flex-col gap-2">
        <Link className="text-blue-300 line-clamp-2" target="_blank" to={item.url}>{item.title}</Link>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 items-center">
            <label htmlFor={`quantity-${index2}`} className="text-soft-white">Qty:</label>
            <select
              id={`quantity-${index2}`}
              className="bg-[#323232ff] rounded text-soft-white px-2 py-1"
              defaultValue={qtyValue}
              onChange={onQuantityChange}
            >
              {item.quantity_options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShoppingCartItem = ({index1, item, updateQuantity}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {currentAccount} = useContext(AccountContext);

  const checkoutHandler = async () => {
    setIsLoading(true);
    await axiosApi.post('/checkout', {data: item, email: currentAccount}).then((response) => {
      setIsClicked(true);
    }).finally(() => {
      setIsLoading(false);
    })
  }

  return (
    <div key={index1} className="bg-[#262626FF] text-soft-white rounded-xl px-8 py-6 flex flex-col gap-3">
      {
        !isLoading ? (
            <>
              <div className="flex gap-4 justify-between items-center">
                <div className="flex flex-row gap-2 items-center">
                  <div>Shopping Cart {index1 + 1}</div>
                  {isClicked && <FaCheck className="text-green-500" size={16}/>}
                </div>
                <button
                  onClick={checkoutHandler}
                  className="bg-vibrant-orange text-soft-white text-sm font-semibold py-2 px-8 rounded-xl">
                  Checkout
                </button>
              </div>
              <div className="w-full h-[2px] bg-[#363636FF]">
              </div>
              <div className="flex flex-col gap-4">
                {
                  item.map((item, index2) => {
                    return <GroupItem key={index2} item={item} index1={index1} index2={index2}
                                      updateQuantity={updateQuantity}/>
                  })
                }
              </div>
            </>
          )
          :
          (
            <div className="w-full h-[200px] flex items-center justify-center flex-col">
              <div><CgSpinner className="animate-spin" size={32}/></div>
              <div>Checkout in Progress...</div>
              <div>Complete the Checkout or Close the browser</div>
              <div className="text-sm text-red-500">Please don't initiate another checkout before Completion.</div>
            </div>
          )
      }
    </div>
  )
}
const GroupCards = ({updateQuantity}) => {
  const {processedData} = useContext(AutomationContext);

  return (
    <div className="flex flex-col gap-8">
      {processedData.error_results.length > 0 &&
        <div className="flex flex-col gap-2">
          {
            processedData.error_results.map((item, index) => {
              return (<ErrorItem item={item} key={index}/>)
            })
          }
        </div>
      }
      <div className="flex flex-col gap-4">
        {
          processedData.results.map((group, index1) => <ShoppingCartItem key={index1} item={group}
                                                                         updateQuantity={updateQuantity}
                                                                         index1={index1}/>)
        }
      </div>
    </div>

  )
};

export default GroupCards;