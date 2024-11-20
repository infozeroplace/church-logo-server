const calculateRevisionCount = (value1, value2) => {
  let revisionCount = value1;
  if (value2.length) {
    return (revisionCount += +value2[0]?.value?.split(" ")[0]);
  }

  return revisionCount;
};

export default calculateRevisionCount;
