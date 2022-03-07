/* Magic Mirror
 * Module: ScreenManager
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */

Module.register("EXT-ScreenManager", {
  requiresVersion: "2.18.0",
  defaults: {
    debug: false,
    ON: [ "0 8 * * *" ],
    OFF: [ "0 22 * * *" ],
    forceLock: true
  },

  start: function () {
    this.Manager = {
      assistantSpeak: false,
      power: null,
      wanted: true,
      started: false
    }
    this.turnOffTimer = null
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.style.display = "none"
    return dom
  },

  notificationReceived: function (notification, payload, sender) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("CONFIG", this.config)
        break
      case "GAv4_READY":
        if (sender.name == "MMM-GoogleAssistant") this.sendNotification("EXT_HELLO", this.name)
        break
      case "USER_PRESENCE":
        if (payload && !this.Manager.started) {
          if (!this.Manager.power && this.config.forceLock) this.sendNotification("EXT_SCREEN-FORCE_LOCK")
          this.Manager.power = true
          this.Manager.started = true
          if (this.config.forceLock) this.hideCounter()
        }
        break
      case "SCREEN_POWER-ON":
        if (!this.Manager.power && this.config.forceLock) this.sendNotification("EXT_SCREEN-FORCE_LOCK")
        this.Manager.power = true
        if (!this.Manager.wanted) {
          if(this.config.forceLock) this.sendNotification("EXT_SCREEN-FORCE_LOCK")
          this.turnOffbyTimer()
        }
        break
      case "SCREEN_POWER-OFF":
        this.Manager.power = false
        break
      case "ASSISTANT_LISTEN":
      case "ASSISTANT_THINK":
      case "ASSISTANT_REPLY":
      case "ASSISTANT_CONTINUE":
      case "ASSISTANT_CONFIRMATION":
      case "ASSISTANT_ERROR":
      case "ASSISTANT_HOOK":
        clearTimeout(this.turnOffTimer)
        this.turnOffTimer = null
        if (this.config.forceLock) this.sendNotification("EXT_SCREEN-FORCE_UNLOCK")
        break
      case "ASSISTANT_STANDBY":
        if (!this.Manager.wanted) this.turnOffbyTimer()
        break
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "ON":
        this.sendNotification("EXT_SCREEN-WAKEUP")
        if (this.config.forceLock) this.sendNotification("EXT_SCREEN-FORCE_LOCK")
        this.Manager.wanted = true
        break
      case "OFF":
        if (this.config.forceLock) this.sendNotification("EXT_SCREEN-FORCE_UNLOCK")
        this.sendNotification("EXT_SCREEN-END")
        this.Manager.wanted = false
        break
    }
  },

  hideCounter: function() {
    // force to hide EXT-Screen module (not needed)
    var Screen = document.getElementById("EXT-SCREEN")
    Screen.setAttribute('style', "display: none")
  },

  turnOffbyTimer: function() {
    clearTimeout(this.turnOffTimer)
    this.turnOffTimer = null
    this.turnOffTimer= setTimeout(() => {
      if (this.config.forceLock) this.sendNotification("EXT_SCREEN-FORCE_UNLOCK")
      this.sendNotification("EXT_SCREEN-END")
    }, 1000)
  }
});
