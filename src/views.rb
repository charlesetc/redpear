require 'mustache'

module Views
  def self.mustache(file)
    cls = Class.new(Mustache)
    cls.template_file = file
    cls.new
  end

  Landing = Views.mustache('views/landing.html')
  module Projects
    Index = Views.mustache('views/projects/index.html')
    Overview = Views.mustache('views/projects/overview.html')
  end
end

