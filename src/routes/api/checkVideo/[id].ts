const shotStackEndpoint = `https://api.shotstack.io/${import.meta.env.VITE_SHOTSTACK_ENVIRONMENT}`;

export const get = async ({ params }) => {
    const headers = {
        accept: 'application/json',
        'x-api-key': import.meta.env.VITE_SHOTSTACK_API_KEY,
    };

    const res = await fetch(`${shotStackEndpoint}/render/${params.id}`, {
        method: 'GET',
        headers,
    });

    if (res.ok) {
        const out = await res.json();

        return {
            status: res.status,
            'content-type': 'application/json',
            body: out,
        };
    }

    return {
        status: res.status,
    }
};
