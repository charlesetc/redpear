require 'sinatra'
require 'toml'
require 'bcrypt'
require 'walnut'
require_relative 'views.rb'
require_relative 'utils.rb'

SECRETS = TOML.load_file(".secrets.toml")

enable :sessions
set :public_folder, "static"
set :session_secret, SECRETS['session']

get '/' do
  if session[:user]
    user = current_user
    projects = :project.findmany({user:,}).sort_by { |p| p.created_at }
    Views::Projects::Index.render({user:, projects:})
  else
    Views::Landing.render
  end
end

get "/projects" do 
  redirect("/")
end

def current_user
  :user.findone({email: session[:user]})
end

post '/sign-up' do 
  email = params['email']
  password = params['password']
  salt = BCrypt::Engine::generate_salt()
  hash = BCrypt::Engine::hash_secret(password, salt)
  if :user.findone({email:})
    return 'user already exists' 
  else
    :user.({email:, salt:, hash:})
    session[:user] = email
  end
  redirect('/')
end

get '/log-out' do
  session[:user] = nil
  redirect('/')
end

post '/log-in' do
  email = params['email']
  password = params['password']
  user = :user.findone({email:})
  return 'incorrect email or password' unless user

  hash = BCrypt::Engine::hash_secret(password, user.salt)
  if user.hash == hash
    session[:user] = email
    redirect('/')
  else
    return 'incorrect email or password'
  end
end

post '/projects/new' do
  name = Utils.generate_name
  project = :project.({name:, user: current_user}) if current_user
  redirect("/")
  # redirect("/projects/#{project.id}")
end

get '/projects/:id' do
  id = params[:id]
  project = :project.findone({id:,})
  user = current_user
  if project.user == current_user
    Views::Projects::Overview.render({user:, project:,})
  else
    redirect('/')
  end
end
