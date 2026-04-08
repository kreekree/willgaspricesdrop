export default async function handler(_req, res) {
  const key = process.env.EIA_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'EIA_API_KEY not configured' });
    return;
  }
  const states = ['SCA','SCO','SCT','SFL','SGA','SIL','SIN','SMA','SMD','SMI','SMN','SMO','SNC','SNJ','SNY','SOH','SPA','STX','SVA','SWA','SWI'];
  const facets = states.map(s => `facets[duoarea][]=${s}`).join('&');
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${key}&frequency=weekly&data[0]=value&facets[product][]=EPM0&${facets}&sort[0][column]=period&sort[0][direction]=desc&length=84`;
  const r = await fetch(url);
  const j = await r.json();
  if (!j.response?.data) {
    console.error('EIA API error:', JSON.stringify(j));
  }
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.json(j.response?.data || []);
}
