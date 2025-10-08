// api/steam/appreviews/[appId]/index.js
module.exports = async (req, res) => {
  console.log('=== STEAM API REQUEST START ===');
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(200).end();
  }

  try {
    // Extrair parâmetros
    const { appId } = req.query;
    const { language = 'english', filter = 'recent', review_type = 'all', purchase_type = 'all', num_per_page = '10' } = req.query;

    console.log('Parameters received:', {
      appId,
      language,
      filter,
      review_type,
      purchase_type,
      num_per_page
    });

    if (!appId) {
      throw new Error('App ID is required');
    }

    // Construir URL da Steam
    const steamUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=${language}&filter=${filter}&review_type=${review_type}&purchase_type=${purchase_type}&num_per_page=${num_per_page}`;
    
    console.log('Fetching from Steam URL:', steamUrl);

    // Fazer requisição para Steam
    const response = await fetch(steamUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    console.log('Steam response status:', response.status);

    if (!response.ok) {
      throw new Error(`Steam API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched data from Steam');

    // Retornar dados
    res.status(200).json(data);

  } catch (error) {
    console.error('ERROR:', error.message);
    res.status(500).json({ 
      error: 'Erro ao buscar reviews da Steam',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    console.log('=== STEAM API REQUEST END ===');
  }
};