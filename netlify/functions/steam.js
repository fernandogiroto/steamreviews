// netlify/functions/steam.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { appId, language = 'english', num_per_page = '10' } = event.queryStringParameters;
    
    console.log('Parameters:', { appId, language, num_per_page });

    if (!appId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'App ID é obrigatório' })
      };
    }

    const steamUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=${language}&filter=recent&review_type=all&purchase_type=all&num_per_page=${num_per_page}`;

    console.log('Fetching from Steam:', steamUrl);

    const response = await fetch(steamUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao buscar reviews da Steam',
        details: error.message
      })
    };
  }
};