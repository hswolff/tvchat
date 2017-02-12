import {
  Schema,
} from 'mongoose';

export default new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  show: {
    type: Schema.Types.ObjectId,
    ref: 'Show',
    required: true,
    index: true,
  },
  message: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
