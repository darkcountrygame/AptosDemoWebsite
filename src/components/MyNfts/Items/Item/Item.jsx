import React from "react";
import "./Item.scss";

export const Item = ({ item, setSelectedItems, selectedItems }) => {

  const handleSelect = () => {
    const found = selectedItems.find((i) => i === item);

    if (found) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([item]);
    }
  };

  return (
    <div
      className={`item-wrapper ${
        selectedItems.find((i) => i === item) ? "selected" : ""
      }`}
      onClick={handleSelect}
    >
      <img src={item.uri} className="item-img" />
      <span className="item-name">{item.name}</span>
    </div>
  );
};
