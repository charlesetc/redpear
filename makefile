run: 
	@tmux split-pane -v make build-js
	@rerun rackup

build-js:
	esbuild frontend/main.jsx \
		--jsx-import-source=bourbon-vanilla \
		--jsx=automatic \
		--bundle \
		--outfile=site/main.js \
		--watch

irb: 
	@bundle exec irb -r walnut
