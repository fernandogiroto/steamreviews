// api/steam/appreviews/[appId].js
module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { appId } = req.query;
  const { language, filter, review_type, purchase_type, num_per_page } = req.query;

  try {
    const targetUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=${language}&filter=${filter}&review_type=${review_type}&purchase_type=${purchase_type}&num_per_page=${num_per_page}`;

    console.log('Fetching from Steam:', targetUrl);

    const response = await fetch(targetUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
      }
    });

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error fetching Steam reviews:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar reviews da Steam',
      details: error.message 
    });
  }
};