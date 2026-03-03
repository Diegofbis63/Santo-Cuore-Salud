const fetchLogo = async () => {
  const res = await fetch('https://www.santocuore.com.ar/');
  const text = await res.text();
  const matches = text.match(/<img[^>]+src="([^">]+)"/ig);
  console.log(matches?.filter(m => m.toLowerCase().includes('logo')));
};
fetchLogo();
