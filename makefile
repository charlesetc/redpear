run:
	@tmux split-pane -v make build-vanilla
	@tmux split-pane -v make build-react
	@find ruby views | APP_ENV=development entr -c -d -r rackup -p 9292

prod:
	bash build_helpers/build_vanilla.sh   ## no --watch
	bash build_helpers/build_react.sh   ## no --watch
	APP_ENV=production bundle exec rackup -p 9292

pull:
	git pull

build-vanilla:
	bash build_helpers/build_vanilla.sh --watch

build-react:
	bash build_helpers/build_react.sh --watch

rsync: 
	find ruby javascript views static | entr rsync -v -a ./ redpear:~/redpear-rsync

irb:
	@bundle exec irb -r walnut

.PHONY: prod run build-js irb
