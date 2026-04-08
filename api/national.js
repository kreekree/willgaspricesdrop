export default async function handler(req, res) {
  const key = process.env.EIA_API_KEY;
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${key}&frequency=weekly&data[0]=value&facets[product][]=EPM0&facets[duoarea][]=NUS&sort[0][column]=period&sort[0][direction]=desc&length=13`;
  const r = await fetch(url);
  const j = await r.json();
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.json(j.response?.data || []);
}
