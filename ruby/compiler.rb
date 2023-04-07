
class SingleVersionDir
  def initialize(project)
    timestamp = Time.now.utc.strftime('%Y-%m-%dT%H:%M:%S')
    @dir = "./user-state/#{project.id}/#{timestamp}"
    @requires = "#{@dir}/requires.rb"
    @routes = "#{@dir}/routes.rb"
    write_in_dir(@routes, "require_relative \"./routes.rb\"\n")
    Dir.mkdir_p(@dir)
  end

  def write_in_dir(file, content)
    File.write(File.join(@dir, file), content)
  end

  def add_require(filename)
    File.open(@requires, "a") do |f|
      f.write("require_relative \"./#{filename}\"\n")
    end
  end

  def add_route(route, function)
    File.open(@routes, "a") do |f|
      f.write(<<ROUTE
#{route.method.downcase} "#{route.pattern.downcase}" do
  #{function.name}()
end
ROUTE
      )
    end
  end

  def write_function(function)
    filename = "#{function.name}-#{function.id}.rb"
    write_in_dir(filename, function.source)
    add_require(filename)
    add_route(route, function)
  end
end

def compile_function(function, outdir)
  filename = "#{function.name}-#{function.id}.rb"
end

def compile_project(project)
  dir = SingleVersionDir.new(project)
  :function.findmany(project: project, deleted: false).each do |function|
    dir.write_function(function)
    compile_function(function, dir)
  end
end
