# From https://github.com/SeleniumHQ/selenium/blob/trunk/rb/lib/selenium/webdriver/common/port_prober.rb
# License Apache License 2.0

require 'socket'

module Ports

  MAX = 65535

  def self.find_unused()
    # find a free port -we do this random thing so we don't have to
    # scan further and further as we start more processes.
    self.find_above(rand(1024..MAX-1000))
  end


  def self.find_above(port)
    until free? port do
      port += 1
    end
    port
  end

  def self.free?(port)
    interfaces = Socket.getaddrinfo('localhost', 8080).map { |e| e[3] }
    interfaces += ['0.0.0.0']
    interfaces.compact.uniq.each do |host|
      TCPServer.new(host, port).close
    rescue Errno::EADDRNOTAVAIL, Errno::EAFNOSUPPORT => _e
      # ignored - some machines appear unable to bind to some of their interfaces
    end
    true
  rescue SocketError, Errno::EADDRINUSE
    false
  end
end
