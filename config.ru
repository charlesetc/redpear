require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'mustache'
require_relative './ruby/main.rb'

IS_PROD = ENV['APP_ENV']

run Sinatra::Application
