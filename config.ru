require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'mustache'
require_relative './ruby/main.rb'

IS_PROD = ENV['APP_ENV'] === 'production'
DOMAIN = IS_PROD ? "redpear.dev" : "redpear.local"

run Sinatra::Application
