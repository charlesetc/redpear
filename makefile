build:
	esbuild src/main.jsx \
		--jsx-import-source=bourbon-vanilla \
		--jsx=automatic \
		--bundle \
		--outfile=site/main.js \
		--watch

min:
	esbuild src/main.jsx \
		--jsx-import-source=bourbon-vanilla \
		--jsx=automatic \
		--bundle \
		--minify \
		--outfile=site/main.js \
		--watch

serve:
	python3 -m http.server 4000 --directory site
