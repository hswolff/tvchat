import {
  Schema,
} from 'mongoose';

export default new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
    unique: true,
  },
  showId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
