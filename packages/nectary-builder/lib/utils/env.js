const NODE_ENV = process.env.NODE_ENV || 'development';

exports.NODE_ENV = NODE_ENV;
exports.isDevelopment = NODE_ENV === 'development';
exports.isProduction = NODE_ENV === 'production';
