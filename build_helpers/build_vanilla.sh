#!/bin/bash
./build_helpers/esbuild $(find javascript/vanilla -type f) \
	--jsx-import-source=bourbon-vanilla \
	--jsx=automatic \
    --sourcemap \
	--outdir=static/js/vanilla \
	--bundle \
	"$@"
