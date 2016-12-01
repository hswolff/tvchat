import {
  Schema,
} from 'mongoose';

export default new Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  shows: [{
    type: Schema.Types.ObjectId,
    ref: 'Show',
  }],
});
