# Cross-language copy-paste detection (replaces SonarCloud's duplication metric).
# Requires `npm ci` under ui/ so the pinned jscpd binary is available.
.PHONY: duplication
duplication:
	ui/node_modules/.bin/jscpd --config .jscpd.json

check-ruff:
	ruff check ord_app/

check-pytype:
	pytype -j auto

.PHONY: formating
python-formating:
	ruff check ord_app/ --fix

.PHONY: checking
python-checking: check-ruff check-pytype
