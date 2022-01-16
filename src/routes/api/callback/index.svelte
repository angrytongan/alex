<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { deviantArt } from '$lib/store';

    let message = 'Parsing authentication response, stand by...';

    /*
     * SvelteKit doesn't handle hashes yet..?
     */
    if (browser) {
        const hash = window.location.href.split('#')[1];
        if (hash) {
            const params = new URLSearchParams(hash);
            const state = params.get('state');
            const accessToken = params.get('access_token');

            if (state === $deviantArt.state) {
                deviantArt.setItem('access_token', accessToken);
            }

            message = 'Got an access token; stand by...';
            setTimeout(() => goto('/'), 2 * 1000);
        } else {
            message = 'failed to get access token.';
            console.log($page.url);
        }
    }
</script>

<p>{message}</p>
