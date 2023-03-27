run:
	@tmux split-pane -v make build-js
	@rerun rackup

build-js:
	bash build_helpers/build_js.sh

irb:
	@bundle exec irb -r walnut
