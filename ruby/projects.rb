post '/project/new' do
  name = Utils.generate_project_name
  project = :project.(name:, user: current_user) if current_user
  redirect("/")
  # redirect("/projects/#{project.id}")
end

get '/project/:id' do
  id = params[:id]
  project = :project.findone(id: id)
  functions = :function.findmany(project: project, deleted: false).sort_by { |p| p.created_at }
  user = current_user
  if project.user == user
    Views::Project::Show.render({user:, project:, functions:,})
  else
    redirect('/')
  end
end
