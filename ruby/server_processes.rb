require_relative 'caddy.rb'
require_relative 'compiler.rb'
require_relative 'ports.rb'

module ServerProcesses

  def self.kill_process(project, pid)
    begin
      Process.kill(15, pid) if pid
    rescue Errno::ESRCH => e
      LOG.info "oops tried to kill #{project.name}'s process that did not exist: #{pid}"
    end
  end

  def self.get_pid(project:, mode:)
      mode == :prod ? project.prod_pid : project.dev_pid
    end

  def self.kill(project:, mode:)
    self.kill_process(project, self.get_pid(project:, mode:))
  end

  def self.bwrap(project_root)
    project_root = File.expand_path(project_root)
    gemfile = File.expand_path("./Gemfile")
    walnut = File.expand_path("../walnut")
    rbenv = File.expand_path("~/.rbenv")
    gems = File.expand_path("~/.gem")
    vendor = File.expand_path("./vendor")
    store_home = File.expand_path(project_root + "/../store")
    raise "invalid project root #{project_root}" unless project_root.include?("redpear/user-state")
    if IS_PROD
      [
        "bwrap",
        "--die-with-parent",
        "--unshare-all",
        "--share-net",
        "--chdir", project_root,
        "--bind", project_root, project_root,
        "--ro-bind", "/usr", "/usr",
        "--ro-bind", "/lib", "/lib",
        "--ro-bind", "/lib32", "/lib32",
        "--ro-bind", "/lib64", "/lib64",
        "--ro-bind", "/proc/self", "/proc/self",
        "--ro-bind", rbenv, rbenv,
        "--ro-bind", gems, gems,
        "--ro-bind", gemfile, gemfile,
        "--ro-bind", walnut, walnut,
        "--ro-bind", vendor, vendor,
        "--bind", store_home, store_home,
        "--dev", "/dev",
      ]
    else
      []
    end
  end

  def self.spawn(port, project_root:)
    log_directives = { out: "#{project_root}/logs/stdout.log", err: "#{project_root}/logs/stderr.log" }
    Process.spawn(*bwrap(project_root), "bundle", "exec", "rackup", "-p", port.inspect, chdir: project_root, **log_directives)
  end

  def self.rackup(project:, project_root:, mode:)
    if mode == :prod
      prod_port = Ports::find_unused()
      prod_pid = spawn(prod_port, project_root:)
      project.prod_port = prod_port
      project.prod_pid = prod_pid
      LOG.info "started prod process #{prod_pid.inspect} for #{project.name} on port #{prod_port.inspect}"
    elsif mode == :dev
      dev_port = Ports::find_unused()
      dev_pid = spawn(dev_port, project_root:)
      project.dev_port = dev_port
      project.dev_pid = dev_pid
      LOG.info "started dev process #{dev_pid.inspect} for #{project.name} on port #{dev_port.inspect}"
    else
      raise "unknown mode #{mode.inspect}"
    end
  end


  def self.restart(project, mode)
    if mode == :prod
      project.prod_pid = project.pid if project.has_field?(:pid) and not project.has_field?(:prod_pid) # remove this after all projects have pids
    elsif mode == :dev
      project.dev_pid = project.pid if project.has_field?(:pid) and not project.has_field?(:dev_pid) # remove this after all projects have pids
    end
    project_root = Compiler::compile_project(project:, mode:)
    kill(project:, mode:)
    rackup(project:, project_root:, mode:)
    LOG.info "[:reloaded, #{project.name}, #{mode}]"
    Caddy::reload()
  end

  def self.start_all()
    :project.findmany(deleted: false).each do |project|
      project.prod_pid = nil unless project.has_field?(:prod_pid) # remove after all projects do
      project.dev_pid = nil unless project.has_field?(:dev_pid) # remove after all projects do

      project.prod_root = Compiler::compile_project(project:, mode: :prod) if project.prod_root? == nil
      project.dev_root = Compiler::compile_project(project:, mode: :dev) if project.dev_root? == nil

      rackup(project:, project_root: project.prod_root, mode: :prod)
      rackup(project:, project_root: project.dev_root, mode: :dev)
    end
    Caddy::reload()
  end
end
