import { browser } from '$app/env';
import { writable } from 'svelte/store';

const deviantArtInit = {
    access_token: '',
    state: '',
};

const shotStackJobInit = {
    submitted: false,
    id: '',
};

export const localStorageStore = (name: string, init: any) => {
    let storedValue: any = null;

    if (browser) {
        storedValue = localStorage.getItem(name);
    }

    const { subscribe, set, update } = writable(JSON.parse(storedValue) ?? init);

    return {
        subscribe,

        set: (x: any) => {
            if (browser) {
                localStorage.setItem(name, JSON.stringify(x));
            }
            set(x);
        },

        reset: () => {
            if (browser) {
                localStorage.setItem(name, JSON.stringify(init));
            }
            set({ ...init });
        },

        setItem: (field: string, value: string) => {
            update((data: any) => {
                data[field] = value;
                if (browser) {
                    localStorage.setItem(name, JSON.stringify(data));
                }

                return data;
            });
        },
    };
};

export const deviantArt = localStorageStore('deviantArt', { ...deviantArtInit });
export const dailyDeviations = localStorageStore('dailyDeviations', []);
export const shotStackJob = localStorageStore('shotStackJob', { ...shotStackJobInit });
