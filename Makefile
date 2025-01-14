check-ruff:
	ruff check ord_app/

check-pytype:
	pytype -j auto

.PHONY: formating
python-formating:
	ruff check ord_app/ --fix

.PHONY: checking
python-checking: check-ruff check-pytype
