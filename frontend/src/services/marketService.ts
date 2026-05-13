import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface MarketQuote {
  symbol: string;
  price: string | number;
  change: string | number;
  percent_change: string | number;
  trend: 'up' | 'down';
}

export const getMarketQuotes = async (symbols: string[]): Promise<MarketQuote[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/market/quotes`, {
      params: { symbols: symbols.join(',') }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching market quotes from backend:', error);
    return [];
  }
};

export const getSingleQuote = async (symbol: string): Promise<MarketQuote | null> => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/market/quote`, {
      params: { symbol }
    });
    const data = response.data;
    return {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      percent_change: data.percent_change,
      trend: data.change >= 0 ? 'up' : 'down'
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
};
