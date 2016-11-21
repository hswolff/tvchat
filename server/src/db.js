import mongoose from 'mongoose';

// Use ES6 Promises.
mongoose.Promise = global.Promise;

export default function createDbConnection() {
  return mongoose.connect('mongodb://localhost/harrytv');
}
