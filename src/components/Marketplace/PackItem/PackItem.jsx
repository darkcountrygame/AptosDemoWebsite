import { useWallet } from "@aptos-labs/wallet-adapter-react";
import React, { useState } from "react";
import CustomButton from "../../Shared/CustomButton/CustomButton";
import { LoginFirst } from "../../Shared/LoginFirst/LoginFirst";
import minus from "../../../resourses/btn_red_minus.png";
import plus from "../../../resourses/plus_btn.png";

import './PackItem.scss';
import { toast } from "react-toastify";
import { contract_address } from "../../../services/aptos.service";

export const PackItem = ({ item, fetchSales }) => {
  const [countPack, setcountPack] = useState(1);
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  var needHide = false;
  if (item.count < 1) {
    needHide = true;
  }
  if (item.end_time > 0 && new Date().getTime > item.end_time) {
    needHide = true;
  }

  const handlePackIncrement = () => {
    if (countPack + 1 <= item.count && !loading) {
      setcountPack(countPack + 1);
    }
  };

  const handlePackDecrement = () => {
    if (countPack - 1 >= 1 && !loading) {
      setcountPack(countPack - 1);
    }
  };

  const renderDescription = (text) => {
    const lines = text.split(/-[a-z]-/);
    const cardDescription = lines[0];
    const cardChances = lines.slice(1);
    return (
      <ul>
        {cardDescription}
        {cardChances.map((d) => {
          const [rarity, percentage] = d.split(" ");
          return (
            <li className={`${rarity.toLowerCase()}`}>
              {rarity} {percentage}
            </li>
          );
        })}
      </ul>
    );
  };


  const handleBuyPacks = async () => {
    try {
      setLoading(true);
      await signAndSubmitTransaction({
          sender: account.address,
          data: {
            function: `${contract_address}::drops::buy_multiple`,
            functionArguments: [item.id, countPack],
          },
      });
      toast.success("Success!");
      setcountPack(1)
      fetchSales();
    } catch (error) {
      toast.error(error.message || error);
    } finally {
      setLoading(false)
    }
  };

  return (
    <>
      <div className={"pack-item"}>
        <div className={"pack-img-container"}>
          <img src={item.img} alt="pack-img" />
          <div className={`pack-title ${item.rarity.toLowerCase()}`}>
            {item.name}
          </div>
        </div>
        <div className={"pack-about"}>
          <div className={"pack-name"}>
            <p>Name:</p>
            <p>{item.packName}</p>
          </div>
          {/* <div className={"pack-available"}>
            <p>Available:</p>
            <p>{item.count}</p>
          </div> */}
          <div className={"pack-claims"}>
            <p>Remaining packs:</p>
            <p>{item.count}</p>
          </div>
          {/* <div className={'pack-end'}>
                        <p>Ending in:</p>
                        <p><Countdown
                            date={item.finishAt ? item.finishAt : new Date().getTime()}
                            renderer={renderCountdown}
                /></p>
         </div> */}
        </div>
        <div className={"pack-description"}>
          {renderDescription(item.description)}
        </div>
        <div className={"pack-price"}>
          <p>Price:</p>
          <span>{(item.price / 100000000)} APT</span>
        </div>
        <div className={"pack-footer"}>
          {!needHide ? (
            <>
              <div className={"pack-amount"}>
                <img
                  onClick={handlePackDecrement}
                  disabled={true}
                  src={minus}
                  alt="minus"
                  className={countPack < 2 || loading ? "disabled" : ""}
                />
                <div className={"number"}>
                  <span>{countPack}</span>
                </div>
                <img
                  onClick={handlePackIncrement}
                  src={plus}
                  alt="plus"
                  className={
                    countPack >= item.count || loading ? "disabled" : ""
                  }
                />
              </div>
              <div className={"pack-buy"}>
                {account && account.address ? (
                  <CustomButton
                    text={"BUY"}
                    onClick={handleBuyPacks}
                    disabled={needHide}
                    loading={loading}
                  />
                ) : (
                  <LoginFirst />
                )}
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};
