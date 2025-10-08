// api/steam/[...path].js
export default async function handler(req, res) {
  const { path = [] } = req.query;
  
  // Recria a query string
  const queryString = new URL(req.url, `https://${req.headers.host}`).search;
  
  const targetUrl = `https://store.steampowered.com/${path.join('/')}${queryString}`;

  try {
    const response = await fetch(targetUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
      }
    });
    
    if (!response.ok) {
      throw new Error(`Steam API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Configura CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    res.status(200).json(data);
  } catch (err) {
    console.error('Steam API Error:', err.message);
    res.status(500).json({ 
      error: 'Erro ao buscar dados da Steam', 
      details: err.message 
    });
  }
}