const calculateAdditionalItemPrice = (itemArray) => {
  const additionalItems = itemArray?.length > 0 ? itemArray : [];

  return additionalItems.reduce(
    (accumulator, currentValue) => accumulator + currentValue?.price,
    0
  );
};

export default calculateAdditionalItemPrice;
