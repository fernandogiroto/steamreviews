// netlify/functions/game-details.js
exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { appId } = event.queryStringParameters;
    
    if (!appId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'App ID é obrigatório' })
      };
    }

    const detailsUrl = `https://store.steampowered.com/api/appdetails/?appids=${appId}`;

    console.log('Fetching game details:', detailsUrl);

    const response = await fetch(detailsUrl, {
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
    console.error('Game Details Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro ao buscar detalhes do jogo',
        details: error.message
      })
    };
  }
};