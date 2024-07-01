import React from "react";
import "./StakingItem.scss";

export const StakingItem = ({ item, setSelectedItems, selectedItems }) => {
  const handleSelect = () => {
    const found = selectedItems.find((i) => i === item.name);

    if (found) {
      setSelectedItems(selectedItems.filter((i) => i !== item.name));
    } else {
      setSelectedItems([...selectedItems, item.name]);
    }
  };

  return (
    <div
      className={`item-wrapper ${
        selectedItems.find((i) => i === item.name) ? "selected" : ""
      }`}
      onClick={handleSelect}
    >
      <img src={item.uri} className="item-img" />
      <span className="item-name">{item.name}</span>
    </div>
  );
};
