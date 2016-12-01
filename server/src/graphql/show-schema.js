
export const showQuery = `
shows(slug: String): [Show]!
`;

export const showMutation = `
createShow(
  title: String!
  slug: String!
): Show
`;

export const showSchema = `
type Show {
  id: ID!
  title: String!
  slug: String!
  images: ShowImages
  dateCreated: Float!
}

type ShowImages {
  background: String
  poster: String
}
`;

export const showResolver = {
  Query: {
    async shows(root, args, { Models }) {
      if (args.slug != null) {
        let show;
        try {
          show = await Models.Show.findOne(args);
          return [show];
        } catch (e) {
          throw e;
        }
      }

      try {
        const shows = await Models.Show.find();
        return shows;
      } catch (e) {
        throw e;
      }
    },
  },
  Mutation: {
    async createShow(root, args, { Models }) {
      const show = await Models.Show.create(args);
      return show;
    },
  },
};
