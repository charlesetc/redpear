class ProjectDir
  def initialize(project, mode)
    timestamp = Time.now.utc.strftime('%Y-%m-%dT%H:%M:%S')
    @root = "./user-state/#{project.id}/#{mode}-#{timestamp}"
    @requires = "#{@root}/requires.rb"
    @routes = "#{@root}/routes.rb"
    @templates = "#{@root}/templates.rb"
    @config = "#{@root}/config.ru"
    `mkdir -p #{@root}`
    `mkdir -p #{@root}/logs`

    # create the store directory if it doesn't exist
    @store = "./user-state/#{project.id}/store"
    `mkdir -p #{@store}`

    # link to the project-global store directory
    `ln -s "../store" #{@root}/store`
    write_config
    initialize_templates
    :project_dir.(mode:, project:, root: @root)
  end

  def root
    @root
  end

  def initialize_templates
    File.write(@templates, <<END
require 'mustache'
def __mustache(file)
  cls = Class.new(Mustache)
  cls.template_file = file
  return cls.new.method(:render)
end
END
    )
  end

  def write_config
    File.write(@config, <<END
require 'sinatra'
require 'walnut'
require 'net/http'
require_relative './requires.rb'
require_relative './templates.rb'
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
  result = #{function.name}()
  return result.call if result.class == Method
  result
end
ROUTE
        )
      end
    end
  end

  def add_template_reference(template, filename)
    File.open(@templates, "a") do |f|
      f.write(<<TEMPLATE
#{template.name} = __mustache('#{filename}')
def #{template.name}(*args, **kwargs) #{template.name}.call(*args, **kwargs) end
TEMPLATE
      )
    end
  end

  def write_function(function)
    filename = "f-#{function.id}.rb"
    write_file_in_dir(filename, function.source)
    add_require(filename)
    add_route(function)
  end

  def write_html_template(template)
    filename = "t-#{template.id}.html"
    write_file_in_dir(filename, template.source)
    add_template_reference(template, filename)
  end

end

module Compiler
  def self.compile_project(project, mode)
    dir = ProjectDir.new(project, mode)
    :html_template.findmany(project:, deleted: false).each do |html_template|
      dir.write_html_template(html_template)
    end
    :function.findmany(project:, deleted: false).each do |function|
      dir.write_function(function)
    end
    return dir.root
  end
end
