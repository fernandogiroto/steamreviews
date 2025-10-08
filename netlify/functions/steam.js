// netlify/functions/steam.js
exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { appId, language = 'english', num_per_page = '100', cursor = '*' } = event.queryStringParameters;
    
    if (!appId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'App ID é obrigatório' })
      };
    }

    // Construir URL com todos os parâmetros
    let steamUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=${language}&filter=recent&review_type=all&purchase_type=all&num_per_page=${num_per_page}`;
    
    // Adicionar cursor apenas se não for o padrão
    if (cursor && cursor !== '*') {
      steamUrl += `&cursor=${encodeURIComponent(cursor)}`;
    }

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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro ao buscar reviews',
        details: error.message
      })
    };
  }
};