require 'sinatra'
require 'toml'
require 'bcrypt'
require 'mustache'
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
    p [projects, user]
    Views::Projects.render({user:, projects:})
  else
    Views::Landing.render
  end
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
    :user.({email:, password:, salt:, hash:})
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

  hash = BCrypt::Engine::hash_secret(user.password, user.salt)
  if user.hash == hash
    session[:user] = email
    redirect('/')
  else
    return 'incorrect email or password'
  end
end

post '/projects/new' do
  name = Utils.generate_name
  project = :project.({name:, user: current_user})
  redirect('/')
end

get '/projects/:id' do
  content_type :json 
  id = params[:id]
  project = :project.findone({id:,})
  project.to_json
end
