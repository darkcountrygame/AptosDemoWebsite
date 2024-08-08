import { useState } from "react";
import "./MyNftsButtonBlock.scss";
import CustomButton from "../../Shared/CustomButton/CustomButton";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from 'react-toastify';
import { contract_address } from "../../../services/aptos.service";

export const MyNftsButtonBlock = ({
  itemsToStakeOrUnstake = [],
  setItemsToStakeOrUnstake,
  selectedItems,
  fetchUserNfts
}) => {
  const [processing, setProcessing] = useState(false);
  const [price, setPrice] = useState('');
  const { account, signAndSubmitTransaction } = useWallet();

  const handleSell = async () => {
    if (!selectedItems.length) return;

    setProcessing(true);
    try {
      const transactionData = {
        sender: account.address,
        data: {
          function: `${contract_address}::market::create_sale`,
          functionArguments: [
            selectedItems[0].name,
            'Desc',
            [`${selectedItems[0].name}`],
            `${Number(price) * 1e8}`,
            'APT'
          ]
        }
      };
      await signAndSubmitTransaction(transactionData);
      toast.success("Successfully sold!");

      fetchUserNfts();
    } catch (error) {
      toast.error(error.message || error);
    } finally {
      setItemsToStakeOrUnstake([]);
      setProcessing(false);
    }
  };

  return (
    <div className="staking-button-wrapper">
      {selectedItems.length > 0 ? (
        <>
          <p className="items-info">
            Item to Sell: <span>{selectedItems[0].name}</span>
          </p>
          <input
            type="text"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <CustomButton
            text="Sell"
            disabled={!itemsToStakeOrUnstake.length || !price}
            loading={processing}
            onClick={handleSell}
          />
        </>
      ) :
        (
          <p className="items-info">
            Select asset to sell
          </p>
        )}
    </div>
  );
};
