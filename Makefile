check-black:
	black --check .

format-black:
	black .

check-isort:
	isort --check .

format-isort:
	isort .

check-pylint:
	pylint ord_app *.py --fail-under=5.0

check-pytype:
	pytype -j auto

.PHONY: formating
python-formating: format-black format-isort

.PHONY: checking
python-checking: check-black check-isort check-pylint check-pytype

