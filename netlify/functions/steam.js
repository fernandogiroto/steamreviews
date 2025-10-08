// netlify/functions/steam.js - VERSÃO SIMPLIFICADA
exports.handler = async function(event, context) {
  console.log('Function started');
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('Query parameters:', event.queryStringParameters);
    
    const { appId, language = 'english', num_per_page = '10' } = event.queryStringParameters;
    
    if (!appId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'App ID is required' })
      };
    }

    // URL direta para Steam
    const steamUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=${language}&filter=recent&review_type=all&purchase_type=all&num_per_page=${num_per_page}`;
    
    console.log('Fetching from:', steamUrl);

    // Fetch sem dependências externas
    const response = await fetch(steamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log('Steam response status:', response.status);

    const data = await response.json();
    console.log('Data received from Steam');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('ERROR:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};