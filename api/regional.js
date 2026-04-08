export default async function handler(req, res) {
  const key = process.env.EIA_API_KEY;
  const areas = ['R10','R20','R30','R40','R50'];
  const facets = areas.map(a => `facets[duoarea][]=${a}`).join('&');
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${key}&frequency=weekly&data[0]=value&facets[product][]=EPM0&${facets}&sort[0][column]=period&sort[0][direction]=desc&length=10`;
  const r = await fetch(url);
  const j = await r.json();
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.json(j.response?.data || []);
}
