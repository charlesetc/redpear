module Views
  def self.mustache(file)
    cls = Class.new(Mustache)
    cls.template_file = file
    cls.new
  end

  Landing = mustache('views/landing.html')
  Projects = mustache('views/projects.html')
end

