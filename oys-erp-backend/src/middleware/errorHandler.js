function errorHandler(err, req, res, next) {
  console.error('API Hatasi:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Sunucu hatasi',
  });
}

module.exports = errorHandler;
