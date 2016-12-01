import _ from 'lodash';
import Trakt from 'trakt.tv';

const trakt = new Trakt({
  client_id: process.env.TRAKT_API_KEY,
  plugins: ['images'],
  options: {
    images: {
      smallerImages: true,
      fanartApiKey: process.env.FANART_API_KEY,
    },
  },
}, true);

export const feedQuery = `
homepage: [Show]!
`;

export const feedMutation = `
updateHomepage: String!
`;

export const feedSchema = `
`;

export const feedResolver = {
  Query: {
    async homepage(root, args, { Models }) {
      const homepage = await Models.Feed.findOne({ name: 'homepage' }).populate('shows');
      return homepage.shows;
    },
  },
  Mutation: {
    async updateHomepage(root, args, { Models }) {
      const {
        Feed,
        Show,
      } = Models;

      const response = await trakt.shows.trending({
        extended: 'full',
      });
      const showsResponse = response.map(response => response.show);

      const promises = showsResponse.map(async show => {
        const showInstance = Show.createFromTrakttv(show);

        const images = await trakt.images.get(Object.assign({
          type: 'show',
        }, show.ids));

        showInstance.setFanart(images);

        return Show.findOneAndUpdate(
          { slug: showInstance.slug },
          {
            $set: _.omit(showInstance.toObject(), '_id'),
          },
          {
            new: true,
            upsert: true,
          }
        );
      });

      const persistedShows = await Promise.all(promises);

      await Feed.findOneAndUpdate(
        { name: 'homepage' },
        { $set: {
          name: 'homepage',
          shows: persistedShows,
          lastUpdated: Date.now(),
        }},
        { upsert: true }
      );

      return 'success';
    },
  },
};
