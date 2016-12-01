import {
  Schema,
} from 'mongoose';

const DataProviderSchema = new Schema({
  _id: false,
  lastFetched: {
    type: Date,
    default: Date.now,
    required: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

const ShowSchema = new Schema({
  title: {
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
  images: {
    background: String,
    poster: String,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dataProvider: new Schema({
    _id: false,
    trakttv: DataProviderSchema,
    fanart: DataProviderSchema,
  }),
});

ShowSchema.statics.createFromTrakttv = function(data) {
  const Show = this.model('Show');
  return new Show({
    title: data.title,
    slug: data.ids.slug,
    dataProvider: {
      trakttv: {
        data: data,
      },
    },
  });
};

ShowSchema.methods.setFanart = function(data) {
  this.images = {
    background: data.background,
    poster: data.poster,
  };

  this.dataProvider.fanart = {
    lastUpdated: Date.now(),
    data,
  };
};


export default ShowSchema;
