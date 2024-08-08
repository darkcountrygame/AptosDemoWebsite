import React, { useEffect, useState } from "react";
import "./Items.scss";

import { CustomLoader } from "../../Shared/CustomLoader/CustomLoader";
import { Item } from "./Item/Item";

export const Items = ({
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
            <Item
              key={item.name}
              item={item}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
            />
          )):
          <div className="no-items-label">No Items to Sell</div>
          }
        </>
      )}
    </div>
  );
};
