import {
  Schema,
} from 'mongoose';
import { hashPassword } from '../auth';

const UserSchema = new Schema({
  email: {
    type: String,
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
    match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    index: true,
    sparse: true,
    unique: true,
  },
  username: {
    type: String,
    index: true,
    sparse: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 2,
    maxlength: 200,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  if (user.password) {
    user.password = await hashPassword(user.password);
  }

  next();
});

export default UserSchema;
