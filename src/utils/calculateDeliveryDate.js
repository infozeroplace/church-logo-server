const calculateDeliveryDate = (value1, value2) => {
  let initialCount = value1;
  if (value2.length) {
    initialCount = +value2[0]?.value?.split(" ")[0];
  }

  const today = new Date();
  today.setUTCDate(today.getUTCDate() + initialCount);
  return {
    deliveryDateUTC: today.toISOString(),
    deliveryDateString: today.toDateString(),
  };
};

export default calculateDeliveryDate;
