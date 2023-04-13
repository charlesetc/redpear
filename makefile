run:
	@tmux split-pane -v make build-js
	@APP_ENV=development rerun --ignore 'user-state/*' --ignore 'store/*' rackup -p 9292

prod:
	bash build_helpers/build_js.sh   ## no --watch
	APP_ENV=production bundle exec rackup -p 9292

build-js:
	bash build_helpers/build_js.sh  --watch

irb:
	@bundle exec irb -r walnut

.PHONY: prod run build-js irb
