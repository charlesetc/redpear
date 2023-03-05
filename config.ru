require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'mustache'
require_relative './src/main.rb'

run Sinatra::Application
