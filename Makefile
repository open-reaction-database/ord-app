black:
	black .

isort:
	isort .

.PHONY: check
format-python: black isort
	alembic upgrade head