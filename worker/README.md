# TenderGo Worker

## Setup
1. `cd worker`
2. `npm install`
3. Create D1 and replace `database_id` in `wrangler.toml`.
4. `npx wrangler d1 migrations apply tendergo-db --local`
5. `npm run dev`

## Deploy
- `npm run deploy`
