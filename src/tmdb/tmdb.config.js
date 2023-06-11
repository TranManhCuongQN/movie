const baseURL = process.env.TMDB_BASE_URL;
const key = process.env.TMDB_KEY;

const getUrl = (endpoint, params) => {
  const qs = new URLSearchParams(params);

  return `${baseURL}${endpoint}?api_key=${key}&${qs.toString()}`;
};

export default { getUrl };