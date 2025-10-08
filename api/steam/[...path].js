export default async function handler(req, res) {
  const { path = [] } = req.query
  const queryString = req.url.split('?')[1] || ''
  const targetUrl = `https://store.steampowered.com/${path.join('/')}${queryString ? '?' + queryString : ''}`

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const data = await response.json()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dados da Steam', details: err.message })
  }
}
