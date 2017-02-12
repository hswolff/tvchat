import Trakt from 'trakt.tv';

export default new Trakt({
  client_id: process.env.TRAKT_API_KEY,
  plugins: ['images'],
  options: {
    images: {
      smallerImages: true,
      fanartApiKey: process.env.FANART_API_KEY,
    },
  },
}, true);
