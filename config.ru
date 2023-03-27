require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'mustache'
require_relative './ruby/main.rb'

run Sinatra::Application
