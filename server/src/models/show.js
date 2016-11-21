import {
  Schema,
} from 'mongoose';

export default new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    match: /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/,
    index: true,
    unique: true,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});
