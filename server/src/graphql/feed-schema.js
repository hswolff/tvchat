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
      await Models.Feed.updateHomepage();

      return 'success';
    },
  },
};
