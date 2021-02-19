
// @ts-nocheck
export const extend = (function anonymous() {
  if(!window.recovery){
    window.recovery=true

    var ws = function (url, some) {
      var self = this
      this.isFake = true

      if (!!~url.indexOf('ogario')) {} else return new this.WebSocket(url, some)

      this.url = url
      this.readyState = this.OPEN = 1
      this.sockets = []
      this.cached = {}


      var socketsEach = function (fn) {
        for (var i = 0; this.sockets.length > i; i++) fn(this.sockets[i], i)
      }.bind(this)
      this.close = function () {}
      this.newOnmsg = function (event) {
        var t = 11808
        var p = 40
        var ev = {
          data: event.data
        }
        var message = new DataView(event.data)
        var opcode = message.getUint8(0)
        try {
          switch (opcode) {
            case 0:
              this.playerID = message.getUint32(1, true);
              if (this.master && self.sockets[0].isOpened()) {
                self.settedOnmsg(event)
              } else {
                !self.sockets[0].isOpened() && self.settedOnmsg(event)
              }

              break;
            case 100:
              if (!this.master && self.sockets[0].isOpened() && message.getInt16(p) == t)
                try {
                  setTimeout(display(p + 6, message))
                } catch (e) {

                }
            case 20:
            case 30:
            case 100:
              if (!this.master && self.sockets[0].isOpened()) return;
              break;
          }
          self.settedOnmsg(event)

        } catch (e) {

        }
      }

      Object.defineProperty(this, "onmessage", {
        set: function (a) {
          this.settedOnmsg = a
        },
        get: function () {
          return this.settedOnmsg
        }
      });


      this.send = function (data) {
        var message = new DataView(data)
        var opcode = message.getUint8(0)
        switch (opcode) {
          case 3:
          case 10:
          case 11:
          case 12:
          case 15:
          case 16:
          case 17:
          case 18:
          case 20:

            self.cached[opcode] = message
            break;
        }

        socketsEach(function (s, i) {
          s.queue.push(message.buffer)
        })

        this.sendAll()

      }.bind(this)

      this.sendAll = function () {
        socketsEach(function (s) {
          if (s.readyState != 1) return
          for (; s.queue.length > 0;) {
            var data = s.queue.shift()

            var message = new DataView(data)
            var opcode = message.getUint8(0)
            if (opcode == 20 || opcode == 30 || opcode == 100) message.setUint32(opcode == 100 ? 2 : 1, s.playerID, true);

            s.send(message.buffer)
          }
        }.bind(this))
      }.bind(this)

      var display = function (p, m) {
        for (var text = '', length = p; length < m.byteLength; length += 2) {
          var string = m.getUint16(length, true);
          if (string == 0) break
          text += String.fromCharCode(string);
        }
        return text
      }
      var socketInit = function (s, i) {

        var socketCloseListener = function () {
          var so = self.sockets[i] = new self.WebSocket(s);
          so.master = masterid == i 
          so.playerID = 0
          so.binaryType = "arraybuffer"
          so.queue = []
          so.onmessage = self.newOnmsg
          so.isOpened = function () {
            return so.readyState == so.OPEN
          }
          so.imAliveTimer = null
          so.imAlive = function () {
            so.imAliveTimer = setTimeout(function () {
              so.imAlive()
              so.send(1)
            }, 25 * 1000)
          }

          so.onopen = function () {
            for (var opcode in self.cached) {
              so.send(self.cached[opcode].buffer)
            }
            so.master && self.onopen()
            so.imAlive()
          }
          so.onclose = function () {
            so.playerID = 0
            clearTimeout(so.imAliveTimer)
            setTimeout(socketCloseListener, 5000)
          }
        }
        socketCloseListener()
      }.bind(this)

      var query = '';
      try {
        var r = '0';
        var m = '0';
        if (document.body.innerText.indexOf('cdn.ogario.ovh/v4/beta/ogario.v4.js') > -1) {
          m = '1'
        } else if (document.body.innerText.indexOf('legendmod.ml') > -1) {
          m = '2'
        } else if (document.body.innerText.indexOf('deltav4.glitch.me') > -1) {
          m = '3'
        } else if (document.body.innerHTML.indexOf('index.js') > -1) {
          m = '4'
        }
        var s = !!window.scver ? '1' : '0';
        query = '?' + r + m + s;
      } catch (e) {}

      var masterid = this.sockets.push('wss://snez.org:8080/ws' + query)

      window.ogarioWS = this
      window.WebSocket = this.WebSocket
      masterid--
      socketsEach(socketInit)

      return this

    }

    if (!window.WebSocket.prototype.WebSocket || !window.wsinjected) {
      window.wsinjected = true
      ws.prototype.WebSocket = WebSocket
      window.WebSocket = ws

      document.head.appendChild(document.createElement('script')).src = 'https://www.googletagmanager.com/gtag/js?id=UA-145106226-2'
      window.dataLayer = window.dataLayer || [];

      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'UA-145106226-2');
    }
  }
});