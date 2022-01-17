<script lang="ts">
    import { deviantArt, dailyDeviations, shotStackJob } from '$lib/store';
    import utils from '$lib/utils';

    let getDailyDisabled: boolean = false;
    let doShotStackDisabled: boolean = false;
    let shotStackPollTimer: ReturnType<typeof setTimeout>;
    let jobStatus = '';
    let outputURL = '';

    const shotStackPollInterval: number = 10; // seconds
    const holdTime: number = 3; // seconds

    /**
     * Generate the Deviant Art OAuth URL.
     * @returns {string} URL for Deviant Art OAuth.
     */
    const deviantArtAuthURL = () => {
        const state = utils.generateState();
        deviantArt.setItem('state', state);

        const params = new URLSearchParams({
            response_type: 'token',
            client_id: import.meta.env.VITE_DEVIANTART_CLIENT_ID as string,
            redirect_uri: import.meta.env.VITE_DEVIANTART_REDIRECT_URI as string,
            scope: 'browse',
            state,
        });
        return 'https://www.deviantart.com/oauth2/authorize?' + params.toString();
    };

    /**
     * Pull down the daily deviations from Deviant Art.
     */
    const getDailyDeviations = () => {
        getDailyDisabled = true;

        const params = new URLSearchParams({
            with_session: 'false',
            mature_content: 'false',
            access_token: $deviantArt.access_token,
        });
        const url = 'https://www.deviantart.com/api/v1/oauth2/browse/dailydeviations?' + params.toString();

        $dailyDeviations = [];

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                $dailyDeviations = data.results.filter((d) => d.thumbs[0] && d.content?.src);
            })
            .catch((error) => {
                alert(error);
            })
            .finally(() => {
                getDailyDisabled = false;
            });
    };

    /**
     * See where a previous ShotStack job is up to.
     */
    const checkShotStackJob = () => {
        fetch(`/api/checkVideo/${$shotStackJob.id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log('job check', data);

                jobStatus = data.response.status;

                if (data.response.status === 'done') {
                    outputURL = data.response.url;
                }

                if (data.response.status === 'done' || data.response.status === 'failed') {
                    $shotStackJob.submitted = false;
                } else {
                    shotStackPollTimer = setTimeout(checkShotStackJob, shotStackPollInterval * 1000);
                }
            })
            .catch((error) => {
                alert(error);
                clearTimeout(shotStackPollTimer);
            })
            .finally(() => {
            });
    };

    /**
     * Ask ShotStack to generate a video based on the daily deviations.
     */
    const doShotStack = () => {
        doShotStackDisabled = true;
        outputURL = '';

        const body = {
            timeline: {
                tracks: [
                    {
                        clips: $dailyDeviations.map((d, i) => {
                            return {
                                asset: {
                                    type: 'title',
                                    text: `${d.title} - ${d.author.username}`,
                                    position: 'bottomLeft',
                                },
                                start: i * holdTime,
                                length: holdTime,
                            };
                        }),
                    },
                    {
                        clips: $dailyDeviations.map((d, i) => {
                            return {
                                asset: {
                                    type: 'image',
                                    src: d.content.src,
                                },
                                start: i * holdTime,
                                length: holdTime,
                            };
                        }),
                    },
                ],
            },
            output: {
                format: 'mp4',
                resolution: 'sd',
            },
        };

        fetch('/api/generateVideo', {
            method: 'post',
            body: JSON.stringify(body),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log({ data });

                $shotStackJob.submitted = true;
                $shotStackJob.id = data.response.id;

                jobStatus = 'In progress...';

                clearTimeout(shotStackPollTimer);
                shotStackPollTimer = setTimeout(checkShotStackJob, shotStackPollInterval * 1000);
            })
            .catch((error) => {
                alert(error);
            })
            .finally(() => {
                doShotStackDisabled = false;
            });
    };

    /**
     * Jump off to Deviant Art auth.
     */
    const auth = () => {
        window.location.assign(deviantArtAuthURL());
    };

    /**
     * Dump the Deviant Art auth creds.
     * TODO check DA docs for revoke() or similar.
     */
    const deAuth = () => {
        deviantArt.reset();
    };
</script>

{#if $deviantArt.access_token}
    <button type="button" on:click={deAuth}>Drop Deviant Art auth</button>
    <button type="button" on:click={getDailyDeviations} disabled={getDailyDisabled}>Get Daily Deviations</button>

    {#if !$shotStackJob.submitted && $dailyDeviations.length}
        <button type="button" on:click={doShotStack}>Create ShotStack</button>
    {:else}
        <p>{jobStatus}</p>
    {/if}

    {#if outputURL.length}
        <a target="_blank" href={outputURL}>View video</a>
    {/if}

    <hr />
    {#if $dailyDeviations.length}
        {#each $dailyDeviations as d}
            <a target="_blank" href={d.content.src}><img src="{d.thumbs[0].src}" alt={d.title} /></a>
        {/each}
    {/if}
{:else}
    <button type="button" on:click={auth}>Auth to Deviant Art</button>
{/if}
