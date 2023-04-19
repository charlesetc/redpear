require 'mustache'

module Views
  def self.mustache(file)
    cls = Class.new(Mustache)
    cls.template_file = file
    cls.new
  end

  Landing = Views.mustache('views/landing.html')
  Index = Views.mustache('views/index.html')
  Project = Views.mustache('views/project.html')
  Function = Views.mustache('views/function.html')
  Template = Views.mustache('views/template.html')
end
