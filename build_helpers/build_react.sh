#!/bin/bash
./build_helpers/esbuild javascript/react/index.tsx \
    --outdir=static/js/react \
    --sourcemap \
	--jsx=automatic \
	--bundle \
    "$@"
