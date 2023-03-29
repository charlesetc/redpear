require 'sinatra'
require 'toml'
require 'bcrypt'
require 'walnut'
require_relative 'views.rb'
require_relative 'utils.rb'
require_relative 'functions.rb'
require_relative 'projects.rb'

SECRETS = TOML.load_file(".secrets.toml")

enable :sessions
set :public_folder, "static"
set :session_secret, SECRETS['session']

module Sinatra
  module Flash
    def flash(message)
      session[:flash] = message
    end

    def get_flash
      flash = session[:flash]
      session[:flash] = nil
      return flash
    end
  end

  module JSONParams
    def json_params
      begin
        params.merge!(JSON.parse(request.body.read).transform_keys { |k| k.to_sym })
      rescue Exception => e
        p "LOG: Ignoring #{e}"
      end
    end
  end

  helpers Flash, JSONParams
end

def current_user
  :user.findone(email: session[:user])
end

post '/sign-up' do
  email = params['email']
  password = params['password']
  salt = BCrypt::Engine::generate_salt()
  hash = BCrypt::Engine::hash_secret(password, salt)
  if :user.findone(email: email)
    return 'user already exists'
  else
    :user.(email:, salt:, hash:)
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
  user = :user.findone(email:)
  return 'incorrect email or password' unless user

  hash = BCrypt::Engine::hash_secret(password, user.salt)
  if user.hash == hash
    session[:user] = email
    redirect('/')
  else
    return 'incorrect email or password'
  end
end
