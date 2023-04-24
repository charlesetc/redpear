require_relative 'server_processes.rb'

def empty_template(name, project)
  source = <<END
<!doctype html>
<html>
<head>
  <title>#{project.name}::#{name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>
  <h1>#{name}</h1>

  <p>Welcome to my Red Pear app!</p>
</body>
</html>
END
  source.chomp
end


post '/template/new-html' do
    name = Utils.generate_template_name
    project = :project.findone(id: params[:project_id])
    template = :html_template.(
      project:,
      name:,
      source: empty_template(name, project),
      deleted: false,
    )
    redirect back
end

def get_html_template(id)
  template = :html_template.findone(id:,)
  if not template
    flash 'no such template'
    redirect_secure('/')
  end
  if template.project.user != current_user
    flash 'denied'
    redirect_secure('/')
  end
  return template
end

get '/template/:id' do
  template = get_html_template(params[:id])
  functions = :function.findmany(project: template.project, deleted: false)
  Views::Template.render({
    user: current_user,
    template:,
    template_blob: template.to_json_full,
    functions_blob: functions.map {|x| x.to_hash}.to_json,
    project_blob: template.project.to_json_full,
    project: template.project,
    flash: get_flash
  })
end

post '/template/edit' do
  json_params
  id = params[:id]
  template = get_html_template(id)
  template.source = params[:source] if params.key?(:source)
  template.name = params[:name] if params.key?(:name)
  ServerProcesses::restart(template.project)
  redirect back
end

post '/template/delete' do
  template = get_html_template(params[:id])
  template.deleted = true
  ServerProcesses::restart(template.project)
  redirect_secure("/project/#{template.project.id}")
end
