require 'json'

module Caddy

  def self.reload()
    config_file = '/tmp/redpear-caddy-config.json'
    File.write(config_file, self.config().to_json())
    system("caddy reload --config '#{config_file}' > /tmp/out")
    LOG.info("reloaded caddy config")
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
        ]
      }
    end

    def self.config()
      project_routes = :project.all.map do |project|
        reverse_proxy(project.id + ".#{DOMAIN}", project.port)
      end


      {
        logging: {
          logs: {
            default: {
              exclude: [
                "http.log.access.log0"
              ]
            },
            log0: {
              writer: {
                filename: "/var/log/caddy/redpear.log",
                output: "file"
              },
              encoder: {
                format: "json"
              },
              level: "debug",
              include: [
                "http.log.access.log0"
              ]
            }
          }
        },
        apps: {
          http: {
            servers: {
              new_server: {
                logs: {
                  default_logger_name: "log0"
                },
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