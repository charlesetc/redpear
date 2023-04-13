require_relative 'caddy.rb'
require_relative 'compiler.rb'
require_relative 'ports.rb'

module ServerProcesses
  def self.kill(project)
    begin
      Process.kill(15, project.pid) if project.pid
      LOG.info "killed #{project.name}'s process #{project.pid.inspect}"
    rescue Errno::ESRCH => e
      LOG.info "oops tried to kill #{project.name}'s process that did not exist: #{project.pid}"
    end
  end

  def self.rackup(project:, project_dir:)
    port = Ports::find_unused()
    pid = Process.spawn("rackup", "-p", port.inspect, chdir: project_dir.root, **project_dir.log_directives)
    project.port = port
    project.pid = pid
    LOG.info "started new process #{pid.inspect} for #{project.name} on port #{port.inspect}"
  end

  def self.restart(project)
    project.pid = nil unless project.has_field?(:pid) # remove this after all projects have pids
    project_dir = Compiler::compile_project(project)
    kill(project)
    rackup(project:, project_dir:)
    Caddy::reload()
  end
end
