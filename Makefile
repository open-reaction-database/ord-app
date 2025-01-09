black:
	black .

isort:
	isort .

pytype:
	pytype -j auto

.PHONY: check
format-python: black isort