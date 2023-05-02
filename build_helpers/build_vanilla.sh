#!/bin/bash
esbuild $(find javascript/vanilla -type f) \
	--jsx-import-source=bourbon-vanilla \
	--jsx=automatic \
	--outdir=static/js/vanilla \
	--bundle \
	"$@"
