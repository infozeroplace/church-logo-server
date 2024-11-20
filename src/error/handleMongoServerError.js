import httpStatus from "http-status";

const handleMongoServerError = (error) => {
  // Extract the error messages from the validation error
  const errors = [
    {
      path: error.codeName,
      message: error.errmsg,
    },
  ];

  const statusCode = httpStatus.BAD_REQUEST;

  return {
    statusCode,
    message: "Mongo Server Error",
    errorMessages: errors,
  };
};

export default handleMongoServerError;
