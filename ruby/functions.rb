require_relative 'server_processes.rb'

def empty_function(name)
  source = <<END
def #{name}()
  return "magic is possible"
end
END
  source.chomp
end

post '/function/new' do
    name = Utils.generate_function_name
    project = :project.findone(id: params[:project_id])
    function = :function.(
      project:,
      name:,
      source: empty_function(name),
      route: nil,
      deleted: false,
    )
    redirect back
end

def get_function(id)
  function = :function.findone(id:,)
  if not function
    flash 'no such function'
    redirect('/')
  end
  if function.project.user != current_user
    flash 'denied'
    redirect('/')
  end
  return function
end

get '/function/:id' do
  function = get_function(params[:id])
  functions = :function.findmany(project: function.project, deleted: false)
  Views::Function.render({
    user: current_user,
    function:,
    function_blob: function.to_json_full,
    functions_blob: functions.map {|x| x.to_hash}.to_json,
    project_blob: function.project.to_json_full,
    project: function.project,
    flash: get_flash
  })
end

post '/function/edit' do
  json_params
  id = params[:id]
  function = get_function(id)
  function.source = params[:source] if params.key?(:source)
  function.route = params[:route] if params.key?(:route)
  function.name = params[:name] if params.key?(:name)
  ServerProcesses::restart(function.project, :dev)
  redirect back
end

post '/function/delete' do
  function = get_function(params[:id])
  function.deleted = true
  ServerProcesses::restart(function.project, :dev)
  redirect("/project/#{function.project.id}", :dev)
end
