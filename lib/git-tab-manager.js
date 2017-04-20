'use babel';

import {TabControl} from './tabcontrol';

export default {

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
