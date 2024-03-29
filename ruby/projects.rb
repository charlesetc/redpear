require_relative "./utils.rb"

get '/' do
  LOG.info("handling /, user is #{session[:user]}")
  if session[:user]
    LOG.info("found user, rendering")
    user = current_user
    projects = :project.findmany(user: user, deleted: false).sort_by { |p| p.created_at }
    Views::Index.render({user:, projects:, flash: get_flash})
  else
    LOG.info("no user")
    Views::Landing.render
  end
end

get '/api/project/list' do
  if session[:user]
    content_type :json
    user = current_user
    projects = :project.findmany(user: user, deleted: false).sort_by { |p| p.created_at }
    projects.map(&:to_hash).to_json
  else
    status 403
    "not logged in"
  end
end


get "/project/?" do
  redirect("/")
end

post '/project/new' do
  LOG.info("************ making new project")
  name = Utils.generate_project_name
  # slug = name.gsub(" ", "-").downcase
  project = :project.(
    name:,
    user: current_user,
    deleted: false,
    prod_pid: nil,
    dev_pid: nil,
    prod_port: nil,
    dev_port: nil,
  ) if current_user
  LOG.info("redirecting" + session[:user].to_s)
  ServerProcesses::restart(project, :prod)
  ServerProcesses::restart(project, :dev)
  redirect("/")
  # redirect("/projects/#{project.id}")
end

def get_project(id)
  project = :project.findone(id:,)
  if not project
    flash 'no such project'
    redirect('/')
  end
  if project.user != current_user
    flash 'denied'
    redirect('/')
  end
  return project
end

get '/project/:id' do
  project = get_project(params[:id])
  functions = :function.findmany(project: project, deleted: false).sort_by { |p| p.created_at }
  html_templates = :html_template.findmany(project: project, deleted: false).sort_by { |p| p.created_at }
  user = current_user
  Views::Project.render({
    user:,
    project:,
    project_blob: project.to_json_full,
    functions:,
    functions_blob: functions.map {|x| x.to_hash}.to_json,
    templates_blob: html_templates.map {|x| x.to_hash}.to_json,
  })
end

get '/api/project/:id' do
  content_type :json
  project = get_project(params[:id])
  functions = :function.findmany(project: project, deleted: false).sort_by { |p| p.created_at }
  html_templates = :html_template.findmany(project: project, deleted: false).sort_by { |p| p.created_at }
  {
    user: current_user.to_hash,
    project: project.to_hash,
    functions: functions.map(&:to_hash),
    html_templates: html_templates.map(&:to_hash),
  }.to_json
end

post '/project/edit' do
  json_params
  project = get_project(params[:id])
  project.name = params[:name]
  redirect back
end

post '/project/delete' do
  project = get_project(params[:id])
  :function.findmany(project: project).each { |function| function.deleted = true }
  :html_template.findmany(project: project).each { |template| template.deleted = true }
  project.deleted = true
  redirect("/")
end

get '/project/:id/prod' do
  project = get_project(params[:id])
  if IS_PROD
    redirect "https://#{project.id}.#{DOMAIN}"
  else
    redirect "http://#{request.host}:#{project.prod_port}"
  end
end

get '/project/:id/dev' do
  project = get_project(params[:id])
  if IS_PROD
    redirect "https://#{project.id}-dev.#{DOMAIN}"
  else
    redirect "http://#{request.host}:#{project.dev_port}"
  end
end

get '/project/:id/prod/out' do
  project = get_project(params[:id])
  send_file project.prod_root + '/logs/stdout.log'
end

get '/project/:id/prod/err' do
  project = get_project(params[:id])
  send_file project.prod_root + '/logs/stderr.log'
end

get '/project/:id/dev/out' do
  project = get_project(params[:id])
  send_file project.dev_root + '/logs/stdout.log'
end

get '/project/:id/dev/err' do
  project = get_project(params[:id])
  send_file project.dev_root + '/logs/stderr.log'
end

post '/project/deploy' do
  json_params
  project = get_project(params[:id])
  ServerProcesses.restart(project, :prod)
end
