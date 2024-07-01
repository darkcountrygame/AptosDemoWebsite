import React, { useEffect, useState } from "react";
import "./StakingItems.scss";

import { CustomLoader } from "../../Shared/CustomLoader/CustomLoader";
import { StakingItem } from "./StakingItem/StakingItem";

export const StakingItems = ({
  loading,
  items,
  selectedItems,
  setSelectedItems,
}) => {

  const INITIAL_LIMIT = 60;
  const [limit, setLimit] = useState(INITIAL_LIMIT);

  useEffect(() => {
    const onScroll = ({ target: { scrollingElement: { clientHeight, scrollTop, scrollHeight } } }) => {
        if (clientHeight + scrollTop >= scrollHeight - 300)
            setLimit((prevLimit) => Math.min(prevLimit + INITIAL_LIMIT, items.length));
    }

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
}, [items]);

  return (
    <div className={"staking-items"}>
      {loading ? (
        <CustomLoader width={250} height={20} />
      ) : (
        <>
          {items.length ? items.slice(0, limit).map((item) => (
            <StakingItem
              key={item.name}
              item={item}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
            />
          )):
          <div className="no-items-label">No Items to Stake</div>
          }
        </>
      )}
    </div>
  );
};
