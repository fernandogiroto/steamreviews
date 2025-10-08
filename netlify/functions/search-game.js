// netlify/functions/search-game.js
exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { term } = event.queryStringParameters;
    
    if (!term) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Termo de busca é obrigatório' })
      };
    }

    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=US&l=english`;

    console.log('Searching games:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Steam Search API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Search Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro ao buscar jogos',
        details: error.message
      })
    };
  }
};