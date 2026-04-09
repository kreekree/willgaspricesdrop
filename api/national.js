export default async function handler(_req, res) {
  const key = process.env.EIA_API_KEY;
  if (!key) {
    console.error('EIA_API_KEY is not set');
    res.status(500).json({ error: 'EIA_API_KEY not configured' });
    return;
  }
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${key}&frequency=weekly&data[0]=value&facets[product][]=EPM0&facets[duoarea][]=NUS&sort[0][column]=period&sort[0][direction]=desc&length=13`;
  const r = await fetch(url);
  const j = await r.json();
  if (!j.response?.data) {
    console.error('EIA API error:', JSON.stringify(j));
  }
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.json(j.response?.data || []);
}
