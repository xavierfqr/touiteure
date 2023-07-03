install:
	cp .env.dist .env
	yarn
	yarn setup

start:
	yarn dev

test.unit:
	yarn test
