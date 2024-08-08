import React, { useEffect, useState } from "react";
import "./SecondaryMarketplace.scss";
import { contract_address, getSalesCards } from "../../services/aptos.service";
import { CustomLoader } from "../../components/Shared/CustomLoader/CustomLoader";
import { CardItem } from "../../components/CardItem/CardItem";
import CustomButton from "../../components/Shared/CustomButton/CustomButton";
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


export const SecondaryMarketplace = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [salesCards, setSalesCards] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);


  const fetchSalesCard = async () => {
    setLoading(true)
    try {      
      const sales = await getSalesCards();
      setSalesCards(sales);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false)
    }
  };

  useEffect(() => {
    fetchSalesCard();
  },[])


  const redirectToMyNFTs = () => {
    navigate("/my-nfts");
  };

  

  const handleBuy = async (item) => {
    try {
      // setLoading(true);
      await signAndSubmitTransaction({
          sender: account.address,
          data: {
            function: `${contract_address}::market::buy`,
            functionArguments: [item.id],
          },
      });
      toast.success("Success!");
      fetchSalesCard();
    } catch (error) {
      toast.error(error.message || error);
    } finally {
      setLoading(false)
    }
  };


  return (
    <div className="market-page-container">
      <h1 className="buy-packs">Buy on Secondary Market</h1>
      <div className="market-content">
        {loading ? (
          <CustomLoader width={250} height={20} />
        ) : (
          !!salesCards.length && salesCards.map((item) => {
            return <CardItem key={item.name} item={item} setSelectedItems={setSelectedItems} selectedItems={selectedItems} handleBuy={handleBuy} />;
          })
        )}
      </div>
      <div className="my-nfts">
        {account && account.address && (
          <CustomButton
            text={"My NFTs"}
            onClick={redirectToMyNFTs}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
