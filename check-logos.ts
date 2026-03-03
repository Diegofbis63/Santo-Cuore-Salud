const urls = [
  'https://logo.clearbit.com/osde.com.ar',
  'https://logo.clearbit.com/sancorsalud.com.ar',
  'https://logo.clearbit.com/jerarquicos.com',
  'https://logo.clearbit.com/umana.com.ar',
  'https://logo.clearbit.com/ospg.org.ar',
  'https://logo.clearbit.com/unionpersonal.com.ar'
];

async function check() {
  for (const url of urls) {
    const res = await fetch(url);
    console.log(url, res.status);
  }
}
check();
