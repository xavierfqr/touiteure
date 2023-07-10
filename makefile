install:
	cp .env.dist .env
	yarn

start: db.start
	yarn wait-port 5432 && yarn dev

stop:
	docker compose stop

test.unit:
	yarn test

db.start:
	docker compose up -d postgres

db.init: db.start
	yarn setup

db.connect:
	psql postgresql://skeleton:skeleton@localhost:5432/skeleton
