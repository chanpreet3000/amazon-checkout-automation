import React, {useContext, useState} from "react";
import {Link} from "react-router-dom";
import {axiosApi} from "../../axios";
import {AutomationContext} from "./automation_context/AutomationContext";
import {CgSpinner} from "react-icons/cg";
import {AccountContext} from "../account/AccountProvider";
import {MdOutlineShoppingCartCheckout} from "react-icons/md";
import {FaShoppingCart} from "react-icons/fa";

export const ShoppingCartErrorItem = ({item}) => {
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


const ShoppingCartItem = ({index, item, updateQuantity}) => {
  const [qtyValue, setQtyValue] = useState(item.quantity.toString());

  const onQuantityChange = (e) => {
    setQtyValue(e.target.value)
    updateQuantity(index, e.target.value)
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
            <label htmlFor={`quantity-${index}`} className="text-soft-white">Qty:</label>
            <select
              id={`quantity-${index}`}
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

const ShoppingCart = ({updateQuantity}) => {
  const {processedData} = useContext(AutomationContext);
  const {currentAccount} = useContext(AccountContext);
  const [checkoutInProgress, setCheckoutInProgress] = useState(false);
  const [checkoutErrors, setCheckoutErrors] = useState(null);

  const checkoutHandler = async () => {
    setCheckoutInProgress(true);
    setCheckoutErrors(null);

    await axiosApi.post('/checkout', {data: processedData.results, email: currentAccount}).then((response) => {
      setCheckoutErrors(response.data);
    }).finally(() => {
      setCheckoutInProgress(false);
    })
  }

  return (
    <>
      {checkoutInProgress &&
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center fade-in">
          <div className="w-full flex items-center justify-center gap-2 flex-col text-2xl">
            <div><CgSpinner className="animate-spin" size={44}/>
            </div>
            <div>Checkout in Progress...</div>
            <div className="text-sm text-red-500">Please don't close any browser and wait for all the checkout to go
              through!
            </div>
          </div>
        </div>}

      <div className="flex flex-col gap-6">
        <div className="bg-[#1e1c1c] text-soft-white rounded-xl px-8 py-6 flex flex-col gap-3">
          <div className="flex flex-row gap-2 items-center text-xl font-semibold">
            <FaShoppingCart size={24}/>
            <div>Shopping Cart</div>
          </div>
          <div className="w-full h-[2px] bg-[#363636FF]">
          </div>
          <div className="flex flex-col gap-4">
            {
              processedData.results.map((item, index) => {
                return <ShoppingCartItem key={index} item={item} index={index}
                                         updateQuantity={updateQuantity}/>
              })
            }
          </div>
        </div>
        <div className="flex justify-center">
          <button className="bg-green-700 text-soft-white flex items-center text-lg px-10 py-2 rounded-2xl"
                  onClick={checkoutHandler}>
            <MdOutlineShoppingCartCheckout size={24}/>
            <div>Checkout All Items</div>
          </button>
        </div>

        {/*Render Checkout Errors*/}
        {checkoutErrors &&
          (checkoutErrors.length > 0 ? (
              <div className="flex flex-col gap-4 fade-in bg-[#212121FF] rounded-2xl px-6 py-4">
                <div className="text-soft-white text-xl">Errors occurred during Checkouts</div>
                <div className="flex flex-col gap-4">
                  {
                    checkoutErrors.map((error, index) => {
                      return (
                        <div key={index} className="rounded-2xl bg-red-700 text-soft-white py-2 px-4">
                          <div className="line-clamp-3">
                            {`${error.message}  -  ${error.error}`}
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>)
            : (
              <div className="flex flex-col gap-4 fade-in bg-green-700 rounded-2xl px-6 py-4">
                <div className="text-soft-white text-xl">No Errors During Checkout!</div>
              </div>
            ))
        }
      </div>
    </>
  );
}

const CheckoutProcessedData = ({updateQuantity}) => {
  const {processedData} = useContext(AutomationContext);

  return (
    <div className="flex flex-col gap-8 fade-in">
      {processedData.error_results.length > 0 &&
        <div className="flex flex-col gap-2">
          {
            processedData.error_results.map((item, index) => {
              return (<ShoppingCartErrorItem item={item} key={index}/>)
            })
          }
        </div>
      }
      {processedData.results.length > 0 && <ShoppingCart updateQuantity={updateQuantity}/>}
    </div>
  )
};

export default CheckoutProcessedData;