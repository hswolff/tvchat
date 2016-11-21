import mongoose from 'mongoose';
import ChatMessageSchema from './chat-message';
import ChatUsersSchema from './chat-user';
import RefreshTokenSchema from './refresh-token';
import ShowSchema from './show';
import UserSchema from './user';

export default {
  ChatMessage: mongoose.model('ChatMessage', ChatMessageSchema),
  ChatUser: mongoose.model('ChatUser', ChatUsersSchema),
  RefreshToken: mongoose.model('RefreshToken', RefreshTokenSchema),
  Show: mongoose.model('Show', ShowSchema),
  User: mongoose.model('User', UserSchema),
};
