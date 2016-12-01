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
      await Models.Feed.updateHomepage();

      const homepage = await Models.Feed.findOne({ name: 'homepage' }).populate('shows');
      return homepage.shows;
    },
  },
  Mutation: {
    async updateHomepage(root, args, { Models }) {
      await Models.Feed.updateHomepage({ force: true });

      return 'success';
    },
  },
};
