class ProjectDir
  def initialize(project)
    timestamp = Time.now.utc.strftime('%Y-%m-%dT%H:%M:%S')
    @root = "./user-state/#{project.id}/#{timestamp}"
    @requires = "#{@root}/requires.rb"
    @routes = "#{@root}/routes.rb"
    @config = "#{@root}/config.ru"
    `mkdir -p #{@root}`
    `mkdir -p #{@root}/logs`
    write_config
  end

  def root
    @root
  end

  def log_directives
    return { out: "#{@root}/logs/stdout.log", err: "#{@root}/logs/stderr.log" }
  end

  def write_config
    File.write(@config, <<END
require 'sinatra'
require 'net/http'
require_relative './requires.rb'
require_relative './routes.rb'

run Sinatra::Application
END
    )
  end

  def write_file_in_dir(file, content)
    File.write(File.join(@root, file), content)
  end

  def add_require(filename)
    File.open(@requires, "a") do |f|
      f.write("require_relative './#{filename}'\n")
    end
  end

  def add_route(function)
    File.open(@routes, "a") do |f|
      if function.route
        f.write(<<ROUTE
#{function.route["method"].downcase} "#{function.route["pattern"].downcase}" do
  #{function.name}()
end
ROUTE
        )
      end
    end
  end

  def write_function(function)
    filename = "f-#{function.id}.rb"
    write_file_in_dir(filename, function.source)
    add_require(filename)
    add_route(function)
  end
end

module Compiler
  def self.compile_project(project)
    dir = ProjectDir.new(project)
    :function.findmany(project: project, deleted: false).each do |function|
      dir.write_function(function)
    end
    return dir
  end
end
