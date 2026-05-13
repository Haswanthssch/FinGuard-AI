import axios from 'axios';

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export const finnhubClient = axios.create({
  baseURL: BASE_URL,
  params: {
    token: FINNHUB_KEY,
  },
});

export const getQuote = async (symbol: string) => {
  const response = await finnhubClient.get('/quote', {
    params: { symbol },
  });
  return response.data;
};

export const getMarketNews = async (category = 'general') => {
  const response = await finnhubClient.get('/news', {
    params: { category },
  });
  return response.data;
};

export const getCompanyNews = async (symbol: string, from: string, to: string) => {
  const response = await finnhubClient.get('/company-news', {
    params: { symbol, from, to },
  });
  return response.data;
};
