import React, { useEffect, useState } from "react";
import "./Marketplace.scss";
import { getSales } from "../../services/aptos.service";
import { PackItem } from "../../components/Marketplace/PackItem/PackItem";
import { CustomLoader } from "../../components/Shared/CustomLoader/CustomLoader";

export const Marketplace = () => {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);

  const fetchSales = async () => {
    setLoading(true)
    try {
      const sales = await getSales();
      setSales(sales);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false)
    }
  };

  useEffect(() => {
    fetchSales();
  },[])


  return (
    <div className="market-page-container">
      <h1 className="buy-packs">Buy Packs</h1>
      <div className="market-content">
        {loading ? (
          <CustomLoader width={250} height={20} />
        ) : (
           !!sales.length && sales.map((item) => {
            return <PackItem  key={item.id} item={item} fetchSales={fetchSales} />;
          })
        )}
      </div>
    </div>
  );
};
