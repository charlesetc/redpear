dev:
	tmux split-pane -v make build
	make serve

build:
	esbuild frontend/main.jsx \
		--jsx-import-source=bourbon-vanilla \
		--jsx=automatic \
		--bundle \
		--outfile=site/main.js \
		--watch

min:
	esbuild frontend/main.jsx \
		--jsx-import-source=bourbon-vanilla \
		--jsx=automatic \
		--bundle \
		--minify \
		--outfile=site/main.js \
		--watch

serve:
	node backend/server.js

db: 
	mongosh "mongodb+srv://apricotdb.rsewf.mongodb.net/apricot_database" --apiVersion 1 --username charles
