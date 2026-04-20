/**
 * Centralized error handler for unexpected server errors.
 * Known errors should be returned directly from controllers.
 */
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled API error:", err);

  if (err.name === "ValidationError") {
    const validationErrors = Object.values(err.errors || {}).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    return res.status(400).json({
      message: "Validation failed.",
      errors: validationErrors,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource identifier." });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate key error. Resource already exists." });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error.",
  });
};

module.exports = errorHandler;
