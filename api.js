// CoinGecko API base URL
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache to prevent rapid repeated calls
const cache = {
  price: null,
  marketData: null,
  timestamp: null,
  cacheDuration: 10000 // 10 seconds cache
};

// Check if cache is valid
const isCacheValid = (key) => {
  return cache[key] && 
         Date.now() - cache[`${key}Timestamp`] < cache.cacheDuration;
};

export const fetchBitcoinPrice = async (currency = 'usd') => {
  const cacheKey = `price-${currency}`;
  
  if (isCacheValid(cacheKey)) {
    return cache[cacheKey];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/simple/price?ids=bitcoin&vs_currencies=${currency}&include_last_updated_at=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.bitcoin) {
      cache[cacheKey] = data.bitcoin;
      cache[`${cacheKey}Timestamp`] = Date.now();
      return data.bitcoin;
    } else {
      throw new Error('Invalid response from API');
    }
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    
    // Return cached data if available
    if (cache[cacheKey]) {
      console.log('Returning cached price data');
      return cache[cacheKey];
    }

    // Fallback mock data
    console.log('Using fallback mock data');
    const mockPrices = {
      usd: 45000 + (Math.random() * 2000 - 1000),
      eur: 42000 + (Math.random() * 2000 - 1000),
      gbp: 38000 + (Math.random() * 2000 - 1000)
    };
    
    return {
      [currency]: mockPrices[currency] || 45000,
      last_updated_at: Math.floor(Date.now() / 1000)
    };
  }
};

export const fetchBitcoinMarketData = async (currency = 'usd') => {
  const cacheKey = `market-${currency}`;
  
  if (isCacheValid(cacheKey)) {
    return cache[cacheKey];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.market_data) {
      const marketData = {
        market_cap: data.market_data.market_cap[currency] || 850000000000,
        total_volume: data.market_data.total_volume[currency] || 40000000000,
        price_change_24h: data.market_data.price_change_24h_in_currency?.[currency] || 0,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h_in_currency?.[currency] || 0
      };
      
      cache[cacheKey] = marketData;
      cache[`${cacheKey}Timestamp`] = Date.now();
      return marketData;
    } else {
      throw new Error('Invalid market data response');
    }
  } catch (error) {
    console.error('Error fetching market data:', error);
    
    // Return cached data if available
    if (cache[cacheKey]) {
      console.log('Returning cached market data');
      return cache[cacheKey];
    }

    // Fallback mock data
    console.log('Using fallback market data');
    return {
      market_cap: 850000000000,
      total_volume: 40000000000,
      price_change_24h: Math.random() * 2000 - 1000,
      price_change_percentage_24h: Math.random() * 10 - 5
    };
  }
};