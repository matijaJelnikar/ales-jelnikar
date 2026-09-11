# alesjelnikar.si

Marketing site for a VELUX roof window installation and repair business - <https://alesjelnikar.si/>

Astro 6 + Tailwind 4, content from Sanity, deployed to Cloudflare Workers. Contact forms send mail via Resend.

## Setup

Requires Node `>=22.12.0`.

```sh
npm install
cp .env.example .env   # fill in the values
npm run dev            # localhost:4321
```

`npm run build` outputs to `dist/`. The Sanity Studio lives in `studio/` as a separate npm project.
