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

  def self.rackup(project:, project_root:, mode:)
    log_directives = { out: "#{project_root}/logs/stdout.log", err: "#{project_root}/logs/stderr.log" }

    if mode == :prod
      prod_port = Ports::find_unused()
      prod_pid = Process.spawn("rackup", "-p", prod_port.inspect, chdir: project_root, **log_directives)
      project.prod_port = prod_port
      project.prod_pid = prod_pid
      LOG.info "started prod process #{prod_pid.inspect} for #{project.name} on port #{prod_port.inspect}"
    elsif mode == :dev
      dev_port = Ports::find_unused()
      # TODO: use dev sinatra mode for this
      dev_pid = Process.spawn("rackup", "-p", dev_port.inspect, chdir: project_root, **log_directives)
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
