run:
	@tmux split-pane -v make build-vanilla
	@tmux split-pane -v make build-react
	@find ruby views | APP_ENV=development entr -c -d -r rackup -p 9292

prod:
	bash build_helpers/build_js.sh   ## no --watch
	APP_ENV=production bundle exec rackup -p 9292

pull:
	git pull

build-vanilla:
	bash build_helpers/build_vanilla.sh --watch

build-react:
	bash build_helpers/build_react.sh --watch

irb:
	@bundle exec irb -r walnut

.PHONY: prod run build-js irb
