import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import "./MyNfts.scss";

import {
  getStakedNfts,
  getUserNfts,
} from "../../services/aptos.service.js";

import { StakingItems } from "../../components/Staking/StakingItems/StakingItems.jsx";
import { LoginFirst } from "../../components/Shared/LoginFirst/LoginFirst.jsx";

import useSignAndSubmitTransaction from "../../hooks/useSignAndSubmitTransaction.jsx";
import { MyNftsButtonBlock } from "../../components/MyNfts/MyNftsButtonBlock/MyNftsButtonBlock.jsx";
import { Items } from "../../components/MyNfts/Items/Items.jsx";

export const MyNfts = () => {
  const [userNfts, setUserNfts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // Loaders and loaded states
  const [userNFtsLoading, setUserNFtsLoading] = useState(false);
  const [userNftsLoaded, setUserNftsLoaded] = useState(false);

  const { account } = useWallet();
  useSignAndSubmitTransaction()

  const fetchUserNfts = async () => {
    try {
      setUserNFtsLoading(true);
      const userNfts = await getUserNfts(account?.address);
      setUserNfts(userNfts);
      setUserNftsLoaded(true);
    } catch (error) {
      console.error(error)
    } finally {
      setUserNFtsLoading(false)
    }
  }

  const resetState = () => {
    setUserNfts([]);
    setUserNftsLoaded(false);
  };

  useEffect(() => {
    if (!account) {
      resetState();
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      fetchUserNfts();
    }
  }, [account, userNftsLoaded]);


  return (
    <div className="staking-page-container">
      <h1>Your assets!</h1>
      {account ? (
        <>
          <Items
            loading={userNFtsLoading}
            items={userNfts}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />

          <MyNftsButtonBlock
            itemsToStakeOrUnstake={selectedItems}
            setItemsToStakeOrUnstake={setSelectedItems}
            selectedItems={selectedItems}
            fetchUserNfts={fetchUserNfts}
          />
        </>
      ) : (
        <LoginFirst />
      )}
    </div>
  );
};
