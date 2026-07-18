const mongoose = require('mongoose');

async function isDbConnected() {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  if (mongoose.connection.readyState === 2) {
    try {
      await new Promise((resolve) => {
        const onConnected = () => {
          cleanup();
          resolve(true);
        };
        const onError = () => {
          cleanup();
          resolve(false);
        };
        const timeout = setTimeout(() => {
          cleanup();
          resolve(false);
        }, 3000); // 3 seconds max timeout
        
        function cleanup() {
          mongoose.connection.removeListener('connected', onConnected);
          mongoose.connection.removeListener('error', onError);
          clearTimeout(timeout);
        }
        
        mongoose.connection.once('connected', onConnected);
        mongoose.connection.once('error', onError);
      });
      return mongoose.connection.readyState === 1;
    } catch (e) {
      return false;
    }
  }
  return false;
}

module.exports = { isDbConnected };
