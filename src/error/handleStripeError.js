import httpStatus from "http-status";

const handleStripeError = (error) => {
  // Extract the error messages from the validation error
  const errors = [
    {
      path: error?.raw?.code,
      message: error?.raw?.message,
    },
  ];

  const statusCode = httpStatus.BAD_REQUEST;
  
  return {
    statusCode,
    message: "Stripe Error",
    errorMessages: errors,
  };
};

export default handleStripeError;
