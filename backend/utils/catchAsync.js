/**
 * Async Error Handler Wrapper
 * Eliminates try-catch blocks in controllers
 */

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;