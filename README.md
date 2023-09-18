# GosGos

Dev setup:

```sh
# Set up env file
cp .env.example .env

# Install fresh npm dependencies
npm install

# Start mongo container
docker compose up

# Generate seed data
npm run seed

# Run the app locally
npm run dev
```
