const packagePriceConversion = (pg) => {
  if (pg?.savings) {
    return Number(
      (pg?.basePrice - (pg?.basePrice * pg?.savings) / 100 - 0.01).toFixed(2)
    );
  } else {
    return pg?.basePrice - 0.01;
  }
};

export default packagePriceConversion;
