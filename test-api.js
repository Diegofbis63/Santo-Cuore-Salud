async function test() {
    const url = 'https://santo-cuore-salud.vercel.app/api/chat';
    console.log('Testing URL:', url);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'hola test' }]
            })
        });
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Full Response:', text.substring(0, 500));
    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
}

test();
