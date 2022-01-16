Quick hack playing with ShotStack API.

* Connects to Deviant Art API and pulls down the daily deviations.
* Connects to the ShotStack API and creates a montage of the daily deviations.

### Setup

* Get a [Deviant Art](https://www.deviantart.com/developers/) application and API information.
* Get a [ShotStack](https://dashboard.shotstack.io/register) account and API information.
* Setup `.env` with appropriate keys; see `.env.demo` for format.

### Install
```
% git clone https://github.com/angrytongan/alex.git
% npm install
% npm run dev
```

### Caveats

* The Deviant Art redirect URI **must** be https. To work around this for local development, just change https to http when the browser is redirected. Or look at setting some [certificates for Vite](https://dev.to/web2033/vite-enabling-https-on-localhost-2ckf). Deploying to Vercel / Netlify / et al shouldn't be a problem.
