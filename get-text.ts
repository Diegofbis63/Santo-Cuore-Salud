const fetchText = async () => {
  const res = await fetch('https://www.santocuore.com.ar/');
  const text = await res.text();
  console.log(text.substring(text.indexOf('Misión'), text.indexOf('Misión') + 1000));
  console.log('---');
  console.log(text.substring(text.indexOf('Visión'), text.indexOf('Visión') + 1000));
};
fetchText();
