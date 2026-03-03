const fetchSVG = async () => {
  const res = await fetch('https://www.santocuore.com.ar/');
  const text = await res.text();
  const svgs = text.match(/<svg[^>]*>[\s\S]*?<\/svg>/ig);
  console.log(svgs?.slice(0, 5));
};
fetchSVG();
