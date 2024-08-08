import React, {useState} from "react";
import "./CardItem.scss";
import { LoginFirst } from "../Shared/LoginFirst/LoginFirst";
import CustomButton from "../Shared/CustomButton/CustomButton";
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export const CardItem = ({ item, setSelectedItems, selectedItems, handleBuy }) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  var needHide = false;
  if (item.count < 1) {
    needHide = true;
  }
  if (item.end_time > 0 && new Date().getTime > item.end_time) {
    needHide = true;
  }


  return (
    <div
      className={`item-card-wrapper`}
      // onClick={() => handleSelect(selectedItems)}
    >
      <img src={item.uri} className="item-img" />
      <span className="item-name">{item.name}</span>
      <span className="item-price">Price: {item.price / 1e8} APT</span>

      <div className={"card-buy"}>
        {account && account.address ? (
          <CustomButton
            text={"BUY"}
            onClick={() => handleBuy(item)}
            disabled={needHide}
            loading={loading}
          />
        ) : (
          <LoginFirst />
        )}
      </div>
    </div>
  );
};
