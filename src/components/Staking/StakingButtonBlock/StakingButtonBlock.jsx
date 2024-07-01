import { useState } from "react";
import "./StakingButtonBlock.scss";
import CustomButton from "../../Shared/CustomButton/CustomButton";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from 'react-toastify';
import { contract_address } from "../../../services/aptos.service";

export const StakingButtonBlock = ({
  itemsToStakeOrUnstake = [],
  setItemsToStakeOrUnstake,
  itemsToStake,
  setItemsToStake,
  itemsToUnstake,
  setItemsToUnstake,
  staking,
}) => {
  const [processing, setProcessing] = useState(false);

  const { account, signAndSubmitTransaction } = useWallet();

  const handleStake = async () => {
    setProcessing(true);
    try {
      await signAndSubmitTransaction({
          sender: account.address,
          data: {
            function: `${contract_address}::staking::stake_tokens`,
            functionArguments: [itemsToStakeOrUnstake],
          },
      });
      const newItemsToSet = itemsToStake.filter((i) => itemsToStakeOrUnstake.includes(i.name))
      setItemsToStake(itemsToStake.filter(({ name}) =>  {
        return !itemsToStakeOrUnstake.includes(name)
      }));
      setItemsToUnstake([...newItemsToSet,...itemsToUnstake])
      toast.success("Successfully staked!");
    } catch (error) {
      toast.error(error.message || error);
    } finally {
      setItemsToStakeOrUnstake([]);
      setProcessing(false);
    }
  };

  const handleUnstake = async () => {
    setProcessing(true);
    try {
      await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${contract_address}::staking::unstake_tokens`,
          functionArguments: [itemsToStakeOrUnstake],
        },
    });
      const newItemsToSet = itemsToUnstake.filter((i) => itemsToStakeOrUnstake.includes(i.name))
      setItemsToUnstake(itemsToUnstake.filter(({ name }) => !itemsToStakeOrUnstake.includes(name)));
      setItemsToStake([...newItemsToSet,...itemsToStake])
      toast.success("Successfully unstaked!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setItemsToStakeOrUnstake([]);
      setProcessing(false);
    }
  };

  return (
    <div className={`staking-button-wrapper`}>
      <p className="items-info">
        Items to {staking ? "add" : "remove"}:{" "}
        <span>{itemsToStakeOrUnstake.length}</span>
      </p>

      {itemsToStakeOrUnstake.length > 0 && staking && (
        <CustomButton
          text={"Add"}
          disabled={!itemsToStakeOrUnstake.length}
          loading={processing}
          onClick={handleStake}
        />
      )}
      {itemsToStakeOrUnstake.length > 0 && !staking && (
        <CustomButton
          text={"Remove"}
          loading={processing}
          onClick={handleUnstake}
        />
      )}
    </div>
  );
};
