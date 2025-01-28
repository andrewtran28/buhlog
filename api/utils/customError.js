const CustomError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, CustomError);
  }

  return error;
};

module.exports = CustomError;
