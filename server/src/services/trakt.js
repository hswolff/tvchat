import Trakt from 'trakt.tv';
import traktImages from 'trakt.tv-images';

export default new Trakt({
  client_id: process.env.TRAKT_API_KEY,
  plugins: {
    images: traktImages,
  },
  options: {
    images: {
      smallerImages: true,
      fanartApiKey: process.env.FANART_API_KEY,
    },
  },
}, true);
