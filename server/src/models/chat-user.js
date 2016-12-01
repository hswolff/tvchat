import mongoose, {
  Schema,
} from 'mongoose';

const ChatUser = new Schema({
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

ChatUser.statics.createNamespacedModel = function(id) {
  try {
    return mongoose.model(`ChatUser{id}`);
  } catch (e) { }

  return mongoose.model(`ChatUser{id}`, ChatUser, `chat.users.${id}`);
};

export default ChatUser;
