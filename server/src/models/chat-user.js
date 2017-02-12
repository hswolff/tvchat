import {
  Schema,
} from 'mongoose';

export default new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    unique: true,
  },
  show: {
    type: Schema.Types.ObjectId,
    ref: 'Show',
    index: true,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
