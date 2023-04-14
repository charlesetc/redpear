require_relative "./utils.rb"

get '/' do
  LOG.info("handling /, user is #{session[:user]}")
  if session[:user]
    LOG.info("found user, rendering")
    user = current_user
    projects = :project.findmany(user: user, deleted: false).sort_by { |p| p.created_at }
    Views::Project::Index.render({user:, projects:, flash: get_flash})
  else
    LOG.info("no user")
    Views::Landing.render
  end
end

get "/project/?" do
  redirect_secure("/")
end

post '/project/new' do
  LOG.info("************ making new project")
  name = Utils.generate_project_name
  # slug = name.gsub(" ", "-").downcase
  project = :project.(
    name:,
    user: current_user,
    deleted: false,
    pid: nil,
    port: nil,
  ) if current_user
  LOG.info("redirecting" + session[:user].to_s)
  redirect_secure("/")
  # redirect("/projects/#{project.id}")
end

def get_project(id)
  project = :project.findone(id:,)
  if not project
    flash 'no such project'
    redirect_secure('/')
  end
  if project.user != current_user
    flash 'denied'
    redirect_secure('/')
  end
  return project
end

get '/project/:id' do
  project = get_project(params[:id])
  functions = :function.findmany(project: project, deleted: false).sort_by { |p| p.created_at }
  user = current_user
  Views::Project::Show.render({
    user:,
    project:,
    project_blob: project.to_json_full,
    functions:,
    functions_blob: functions.map {|x| x.to_hash}.to_json,
    domain: DOMAIN,
  })
end

post '/project/edit' do
  json_params
  project = get_project(params[:id])
  project.name = params[:name]
  redirect_secure back
end

post '/project/delete' do
  project = get_project(params[:id])
  :function.findmany(project: project).each { |function| function.deleted = true }
  project.deleted = true
  redirect_secure("/")
end
