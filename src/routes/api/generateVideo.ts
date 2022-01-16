const shotStackEndpoint = `https://api.shotstack.io/${import.meta.env.VITE_SHOTSTACK_ENVIRONMENT}`;

export const post = async (req) => {
    const headers = {
        'Content-type': 'application/json',
        accept: 'application/json',
        'x-api-key': import.meta.env.VITE_SHOTSTACK_API_KEY,
    };

    const res = await fetch(`${shotStackEndpoint}/render`, {
        method: 'POST',
        headers,
        body: req.body,
    });

    if (res.ok) {
        const out = await res.json();

        return {
            status: res.status,
            body: out,
        }
    }

    return {
        status: res.status,
    }
};
