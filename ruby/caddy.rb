require 'json'

module Caddy

  def self.reload()
    File.open('/tmp/redpear-caddy-config.json', 'w') do |f|
      f.write(self.config().to_json())
      system("caddy reload --config '#{f.to_path}' > /tmp/out")
      LOG.info("reloaded caddy config")
    end
  end

  private

    def self.reverse_proxy(host, port)
      {
        match: [{host: [host]}],
        handle: [
          {
            handler: "reverse_proxy",
            upstreams: [
              {
                dial: "localhost:#{port}"
              }
            ]
          }
        ],
        terminal: true
      }
    end

    def self.config()
      project_routes = :project.all.map do |project|
        reverse_proxy(project.id + ".#{DOMAIN}", project.port)
      end

      {
        apps: {
          http: {
            servers: {
              new_server: {
                listen: [":80"],
                routes: [
                  reverse_proxy(DOMAIN, '9292'),
                  *project_routes
                ]
              }
            }
          }
        }
      }
    end
end
