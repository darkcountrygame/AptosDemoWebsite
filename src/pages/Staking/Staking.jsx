import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import "./Staking.scss";

import {
  getStakedNfts,
  getUserNfts,
} from "../../services/aptos.service.js";

import { StakingBlockSelector } from "../../components/Staking/StakingBlockSelector/StakingBlockSelector.jsx";
import { StakingItems } from "../../components/Staking/StakingItems/StakingItems.jsx";
import { LoginFirst } from "../../components/Shared/LoginFirst/LoginFirst.jsx";
import { StakingButtonBlock } from "../../components/Staking/StakingButtonBlock/StakingButtonBlock.jsx";
import useSignAndSubmitTransaction from "../../hooks/useSignAndSubmitTransaction.jsx";

const STAKE_BLOCK = "Stake assets";
const UNSTAKE_BLOCK = "Unstake assets";
const ACTION_BLOCKS = [STAKE_BLOCK, UNSTAKE_BLOCK];

export const Staking = () => {
  const [stakedNfts, setStakedNFts] = useState([]);
  const [userNfts, setUserNfts] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(STAKE_BLOCK);
  const [itemsToStakeOrUnstake, setItemsToStakeOrUnstake] = useState([]);

   // Loaders and loaded states
  const [userNFtsLoading, setUserNFtsLoading] = useState(false);
  const [userStakedNftsLoading, setUserStakedNftsLoading] = useState(false);
  const [userNftsLoaded, setUserNftsLoaded] = useState(false);
  const [stakedNftsLoaded, setStakedNftsLoaded] = useState(false);

  const { account } = useWallet();
  useSignAndSubmitTransaction()


  const handleSelectBlock = (blockToSelect) => {
    setItemsToStakeOrUnstake([]);
    setSelectedBlock(blockToSelect);
  };

  const fetchUserNfts =  async () => {
    try {
      setUserNFtsLoading(true);
      const userNfts = await  getUserNfts(account?.address);
      setUserNfts(userNfts);
      setUserNftsLoaded(true);
    }catch(error) {
      console.error(error)
    } finally {
      setUserNFtsLoading(false)
    }
  }

  const fetchUserStakedNfts =  async () => {
    try {
      setUserStakedNftsLoading(true);
      const userStakedNfts = await  getStakedNfts(account?.address);
      setStakedNFts(userStakedNfts);
      setStakedNftsLoaded(true)
    }catch(error) {
      console.error(error)
    } finally {
      setUserStakedNftsLoading(false)
    }
  }

  const resetState = () => {
    setUserNfts([]);
    setStakedNFts([]);
    setUserNftsLoaded(false);
    setStakedNftsLoaded(false);
  };

  useEffect(() => {
    if (!account) {
      resetState();
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      if (selectedBlock === STAKE_BLOCK && !userNftsLoaded) {
        fetchUserNfts();
      } else if (selectedBlock === UNSTAKE_BLOCK && !stakedNftsLoaded) {
        fetchUserStakedNfts();
      }
    }
  }, [account, selectedBlock, userNftsLoaded, stakedNftsLoaded]);


  return (
    <div className="staking-page-container">
      <h1>Stake your assets!</h1>
      {account ? (
        <>
          <StakingBlockSelector
            actionBlocks={ACTION_BLOCKS}
            selectedBlock={selectedBlock}
            handleSelectBlock={handleSelectBlock}
          />
          {selectedBlock === STAKE_BLOCK && (
            <StakingItems
              loading={userNFtsLoading}
              items={userNfts}
              selectedItems={itemsToStakeOrUnstake}
              setSelectedItems={setItemsToStakeOrUnstake}
            />
          )}
          {selectedBlock === UNSTAKE_BLOCK && (
            <StakingItems
              loading={userStakedNftsLoading}
              items={stakedNfts}
              selectedItems={itemsToStakeOrUnstake}
              setSelectedItems={setItemsToStakeOrUnstake}
            />
          )}
          <StakingButtonBlock
           itemsToStakeOrUnstake={itemsToStakeOrUnstake}
           setItemsToStakeOrUnstake={setItemsToStakeOrUnstake}
           itemsToStake={userNfts}
           setItemsToStake={setUserNfts}
           itemsToUnstake={stakedNfts}
           setItemsToUnstake={setStakedNFts}
           staking={selectedBlock === STAKE_BLOCK}
           />
        </>
      ) : (
        <LoginFirst />
      )}
    </div>
  );
};
