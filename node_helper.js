/* Magic Mirror
 * Module: ScreenManager
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */

const NodeHelper = require("node_helper")
var cron = require('node-cron')
var log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function () {
    console.log("[MANAGER] EXT-ScreenManager Version:", require('./package.json').version, "rev:", require('./package.json').rev)
    this.config = null
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "CONFIG":
        this.config = payload
        if (this.config.debug) log = (...args) => { console.log("[MANAGER]", ...args) }
        log("Config:", this.config)
        this.initialize()
        break
    }
  },

  initialize: function() {
    log("Initialize...")
    // really !? LOL
    log("Initialized!")

    /** main process **/
    this.cronJob()
  },

  /** main cron job **/
  cronJob: function() {
    if (this.config.ON.length) {
      this.config.ON.forEach(on => {
        if (!cron.validate(on)) return console.error("[MANAGER] Error event ON:", on)
        cron.schedule(on, () => {
          this.turnOn()
        })
        log("Added event ON:", on)
      })
    } else log("No event ON")

    if (this.config.OFF.length) {
      this.config.OFF.forEach(off => {
        if (!cron.validate(off)) return console.error("[MANAGER] Error event OFF:", off)
        cron.schedule(off, () => {
          this.turnOff()
        })
        log("Added event OFF:", off)
      })
    } else log ("No event OFF")
  },

  turnOn: function() {
    log("Send: Turn ON Screen")
    this.sendSocketNotification("ON")
  },

  turnOff: function() {
    log("Send: Turn OFF Screen")
    this.sendSocketNotification("OFF")
  }
});
