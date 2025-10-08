// api/steam.js
module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extrair todos os parâmetros da query string
    const { 
      appId, 
      language = 'english', 
      filter = 'recent', 
      review_type = 'all', 
      purchase_type = 'all', 
      num_per_page = '10' 
    } = req.query;

    console.log('Received parameters:', req.query);

    // Validar appId
    if (!appId) {
      return res.status(400).json({ 
        error: 'App ID é obrigatório',
        example: '/api/steam?appId=413150&language=english&num_per_page=10'
      });
    }

    // Construir URL da Steam
    const steamUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=${language}&filter=${filter}&review_type=${review_type}&purchase_type=${purchase_type}&num_per_page=${num_per_page}`;

    console.log('Fetching from Steam:', steamUrl);

    // Fazer requisição para Steam
    const response = await fetch(steamUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Retornar dados
    res.status(200).json(data);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar reviews da Steam',
      details: error.message
    });
  }
};