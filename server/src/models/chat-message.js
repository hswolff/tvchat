import {
  Schema,
} from 'mongoose';

export default new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  showId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  message: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
