'use babel';

import {TabControl} from './tabcontrol';

export default {

  config: {
    someSetting: {
      title: "Test Setting",
      description: "It's a setting",
      type: "integer",
      default: 4
    }
  },

  tabcontrol: null,

  activate(state) {
    console.log("Heyo");
    let _this = this;
    window.setImmediate(function(){
      _this.tabcontrol = new TabControl();
    })
  },


  deactivate() {
    this.tabcontrol.destroy();
  }

};
