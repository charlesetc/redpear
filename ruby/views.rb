require 'mustache'

module Views
  def self.mustache(file)
    cls = Class.new(Mustache)
    cls.template_file = file
    cls.new
  end

  Landing = Views.mustache('views/landing.html')
  module Project
    Index = Views.mustache('views/project/index.html')
    Show = Views.mustache('views/project/show.html')
  end
  module Function
    Show = Views.mustache('views/function/show.html')
  end
  module Template
    Show = Views.mustache('views/template/show.html')
  end
end
