import {
  Schema,
} from 'mongoose';

const NinetyDays = 90 * 24 * 60 * 60 * 1000;

export default new Schema({
  _id: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateExpires: {
    type: Date,
    default: () => Date.now() + NinetyDays,
  },
}, { _id: false });
