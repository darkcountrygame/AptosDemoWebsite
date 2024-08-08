import { useEffect } from 'react';
import { aptos, checkIfUserCanRecieveNfts } from '../services/aptos.service';
import { useWallet } from "@aptos-labs/wallet-adapter-react";


const useSignAndSubmitTransaction = () => {
    const { account, signAndSubmitTransaction} = useWallet();
  
    useEffect(() => {
    const onSignAndSubmitTransaction = async () => {
      if (account) {
        let canRecieveNfts = await checkIfUserCanRecieveNfts(account.address);
        if (!canRecieveNfts) {
          const response = await signAndSubmitTransaction({
            sender: account.address,
            data: {
              function: "0x3::token::opt_in_direct_transfer",
              typeArguments: [],
              functionArguments: [true],
            },
          });
          try {
            await aptos.waitForTransaction({ transactionHash: response.hash });
          } catch (error) {
            console.error(error);
          }
        }
      }
    };

    onSignAndSubmitTransaction();

  }, [account, signAndSubmitTransaction, aptos]);
};

export default useSignAndSubmitTransaction;
