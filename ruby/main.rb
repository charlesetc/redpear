require 'sinatra'
require 'logger'
require 'toml'
require 'bcrypt'
require 'walnut'
require_relative 'views.rb'
require_relative 'projects.rb'
require_relative 'functions.rb'
require_relative 'html-templates.rb'

SECRETS = TOML.load_file(".secrets.toml")

# this is important: for some reason with just
# enable :sessions sinatra ends up wiping the
# session on post.
use Rack::Session::Cookie, :key => 'rack.session',
                           :path => '/',
                           :secret => SECRETS['session']
set :session_secret, SECRETS['session'] # unsure if this is necessary
set :public_folder, "static"

LOG = Logger.new(STDOUT)
set :logger, LOG

def profile(label = "unnamed")
  starting = Time.now
  res = yield
  ending = Time.now
  LOG.info("PROFILE -- #{label} took #{ending - starting}s")
  if ending - starting > 2
    LOG.info "DYING TOO LONG"
    exit
  end
  return res
end

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

  module SecureRedirects
    def redirect(path, *args)
      request.secure = true if IS_PROD
      path = to(path)

      if (env['HTTP_VERSION'] == 'HTTP/1.1') && (env['REQUEST_METHOD'] != 'GET')
        status 303
      else
        status 302
      end

      # According to RFC 2616 section 14.30, "the field value consists of a
      # single absolute URI"
      response['Location'] = uri(path.to_s, settings.absolute_redirects?, settings.prefixed_redirects?)
      halt(*args)
    end
  end

  helpers Flash, JSONParams, SecureRedirects
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
