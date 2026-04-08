export default async function handler(_req, res) {
  const key = process.env.EIA_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'EIA_API_KEY not configured' });
    return;
  }
  // Fetch all areas without filtering — EIA returns all duoareas.
  // We then filter server-side for 3-char state codes starting with "S".
  // This picks up exactly what EIA actually has state-level weekly data for.
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${key}&frequency=weekly&data[0]=value&facets[product][]=EPM0&sort[0][column]=period&sort[0][direction]=desc&length=500`;
  const r = await fetch(url);
  const j = await r.json();
  if (!j.response?.data) {
    console.error('EIA API error:', JSON.stringify(j));
  }
  // Keep only state-level rows (3-char codes like SCA, STX, SNY, etc.)
  const data = (j.response?.data || []).filter(
    row => /^S[A-Z]{2}$/.test(row.duoarea)
  );
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.json(data);
}
