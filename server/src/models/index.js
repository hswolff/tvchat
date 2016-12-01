import mongoose from 'mongoose';
import ChatMessageSchema from './chat-message';
import ChatUsersSchema from './chat-user';
import FeedSchema from './feed';
import RefreshTokenSchema from './refresh-token';
import ShowSchema from './show';
import UserSchema from './user';

export default {
  ChatMessageRoot: mongoose.model('ChatMessageRoot', ChatMessageSchema),
  ChatUser: mongoose.model('ChatUser', ChatUsersSchema),
  Feed: mongoose.model('Feed', FeedSchema),
  RefreshToken: mongoose.model('RefreshToken', RefreshTokenSchema),
  Show: mongoose.model('Show', ShowSchema),
  User: mongoose.model('User', UserSchema),
};
