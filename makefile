run:
	@tmux split-pane -v make build-js
	@APP_ENV=development rerun -d ruby,javascript,views rackup -p 9292

prod:
	bash build_helpers/build_js.sh   ## no --watch
	APP_ENV=production bundle exec rackup -p 9292

pull: 
	git pull

build-js:
	bash build_helpers/build_js.sh  --watch

irb:
	@bundle exec irb -r walnut

.PHONY: prod run build-js irb
