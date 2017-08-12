import {
  Schema,
} from 'mongoose';
import moment from 'moment';
import _ from 'lodash';
import debugCreator from 'debug';
import trakt from '../services/trakt';

const debug = debugCreator('models/feed');

const FeedSchema = new Schema({
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

FeedSchema.methods.canUpdate = function() {
  const now = moment();
  const lastUpdated = moment(this.lastUpdated);
  const canUpdate = now.isAfter(lastUpdated.add(1, 'hours'));

  debug('can update %s', canUpdate);

  return canUpdate;
}

let isUpdatingHomepage = false;

FeedSchema.statics.updateHomepage = async function updateHomepage({ force = false } = {}) {
  debug('updateHomepage');

  const Show = this.model('Show');
  const Feed = this.model('Feed');

  const homepage = await Feed.findOne({ name: 'homepage' });

  if (!force && homepage && !homepage.canUpdate()) {
    return;
  }

  if (isUpdatingHomepage) {
    debug('already updating homepage');
    return;
  }

  debug('updating homepage');
  isUpdatingHomepage = true;

  debug('fetch shows trending');
  const response = await trakt.shows.trending({
    extended: 'full',
    limit: 20,
  });

  const showsResponse = response.map(response => response.show);

  debug('create show objects');
  const persistedShows = await Promise.all(showsResponse.map(show => {
    const showInstance = Show.createFromTrakttv(show);

    return Show.findOneAndUpdate(
      { slug: showInstance.slug },
      {
        $set: _.omit(showInstance.toObject(), '_id'),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  }));

  debug('fetch show images');

  // Don't block thread, let this be done passively.
  await Promise.all(persistedShows.map(async showInstance => {
    if (showInstance.hasImages()) {
      return;
    }

    const images = await trakt.images.get(Object.assign({
      type: 'show',
    }, showInstance.getIdsForFanart()));

    showInstance.setFanart(images);

    return showInstance.save();
  })).then(() => {
    debug('done fetching show images');

    isUpdatingHomepage = false;

    return Feed.findOneAndUpdate(
      { name: 'homepage' },
      {
        $set: {
          name: 'homepage',
          shows: persistedShows,
          lastUpdated: Date.now(),
        }
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  }).catch(() => {
    isUpdatingHomepage = false;
  });
};

export default FeedSchema;
