

get '/' do
  if session[:user]
    user = current_user
        projects = :project.findmany(user: user, deleted: false).sort_by { |p| p.created_at }
        Views::Project::Index.render({user:, projects:, flash: get_flash})
  else
    Views::Landing.render
  end
end

get "/project/?" do
  redirect("/")
end

post '/project/new' do
  name = Utils.generate_project_name
  # slug = name.gsub(" ", "-").downcase
  project = :project.(name:, user: current_user, deleted: false) if current_user
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
  user = current_user
  Views::Project::Show.render({
    user:,
    project:,
    project_blob: project.to_json_full,
    functions:,
    functions_blob: functions.map {|x| x.to_hash}.to_json,
  })
end

post '/project/edit' do
  json_params
  project = get_project(params[:id])
  project.name = params[:name]
  flash 'Saved successfully'
  redirect back
end

post '/project/delete' do
  project = get_project(params[:id])
  :function.findmany(project: project).each { |function| function.deleted = true }
  project.deleted = true
  redirect("/")
end
