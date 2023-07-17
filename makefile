install:
	cp .env.dist .env
	yarn

start: db.start gcs.start
	yarn wait-port 5432 && yarn dev

stop:
	docker compose stop

test.unit:
	yarn test

gcs.start:
	docker compose up -d gcs

db.start:
	docker compose up -d postgres

db.init: db.start
	yarn setup

db.connect:
	psql postgresql://skeleton:skeleton@localhost:5432/skeleton

prisma.generate_client:
	npx prisma generate

prisma.apply_migrations:
	npx prisma migrate deploy
