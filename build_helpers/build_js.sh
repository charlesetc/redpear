#!/bin/bash
esbuild $(find javascript -type f) \
	--jsx-import-source=bourbon-vanilla \
	--jsx=automatic \
	--outdir=static/js \
	--bundle \
	--watch
