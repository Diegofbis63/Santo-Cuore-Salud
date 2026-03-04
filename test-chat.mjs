async function run() {
    const res = await fetch('https://santo-cuore-salud.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: 'user', content: 'hola, requiero turno de pediatria para hoy a las 10, mi nombre es diego' }
            ]
        })
    });

    console.log(res.status);
    const text = await res.text();
    console.log(text);
}

run();
