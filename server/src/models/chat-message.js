import mongoose, {
  Schema,
} from 'mongoose';

const ChatMessage = new Schema({
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

ChatMessage.statics.createNamespacedModel = function(id) {
  try {
    return mongoose.model(`ChatMessage${id}`);
  } catch (e) { }

  return mongoose.model(`ChatMessage${id}`, ChatMessage, `chat.messages.${id}`);
};

export default ChatMessage;
