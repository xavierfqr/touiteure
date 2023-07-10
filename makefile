install:
	cp .env.dist .env
	yarn

start:
	docker compose up -d postgres
	yarn wait-port 5432 && yarn dev

stop:
	docker compose stop

test.unit:
	yarn test

db.init:
	yarn setup

db.connect:
	psql postgresql://skeleton:skeleton@localhost:5432/skeleton
