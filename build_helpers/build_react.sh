#!/bin/bash
esbuild $(find javascript/react -type f) \
    --outdir=static/js/react \
    --sourcemap \
	--jsx=automatic \
    --bundle \
    "$@"
