'use babel';

// import {_.forEach, _.bind, _.isString, _.pull, _.remove, _.uniq, _.concat} from 'lodash';
// import * as fs from 'fs';
import {CompositeDisposable} from 'atom';

export default {

  config: {
    someSetting: {
      title: "Test Setting",
      description: "It's a setting",
      type: "integer",
      default: 4
    }
  },

  subscriptions: null,
  ready: false,

  activate(state) {
    console.log("Heyo");
    this.subscriptions = new CompositeDisposable();
    let _this = this;
    window.setImmediate(function(){
      Promise.all(atom.project.getDirectories().map(
        atom.project.repositoryForDirectory.bind(atom.project)
      ))
        .then(function(repos){
          let _ = require('lodash');
          _.forEach(repos, function(repo){
            if (repo !== null)
            {
              atom.notifications.addSuccess(
                "Git-Tab-Manager observing repository: "+repo.path
              );
              window.localStorage.setItem(`git-tab-manager/${repo.path}/branch`, repo.getShortHead());
              _this.subscriptions.add(
                repo.onDidChangeStatuses(_.bind(_this.updateTabs, _this, repo))
              );
              this.updateTabs(repo);
            }
          });
          _this.ready = true;
        })
    });
  },

  updateTabs(repo)
  {
    if(!this.ready) return;
    let currentBranch = window.localStorage.getItem(`git-tab-manager/${repo.path}/branch`);
    window.localStorage.setItem(`git-tab-manager/${repo.path}/branch`, repo.getShortHead());
    if(currentBranch != repo.getShortHead())
    {
      console.log("Updating:", repo.path);
      let didWork = false;
      let newStash = [];
      let stashed = JSON.parse(
        window.localStorage.getItem(`git-tab-manager/${repo.path}/tabs`)
      ) || [];
      let _ = require('lodash');
      let fs = require('fs');
      _.forEach(atom.workspace.getTextEditors(), function(editor){
        let path = editor.getPath();
        if (_.isString(path))
        {
          _.pull(stashed, path);
          if(!fs.existsSync(path))
          {
            console.log("Stashing:", path);
            newStash.push(path);
            editor.destroy();
            if(!didWork)
            {
              atom.notifications.addInfo("Git-Tab-Manager: Updating tabs");
              didWork = true;
            }
          }
        }
      });
      _.remove(stashed, function(path){
        if(fs.existsSync(path))
        {
          console.log("Restoring:", path);
          atom.workspace.open(path);
          if(!didWork)
          {
            atom.notifications.addInfo("Git-Tab-Manager: Updating tabs");
            didWork = true;
          }
          return true;
        }
        return false;
      });
      window.localStorage.setItem(
        `git-tab-manager/${repo.path}/tabs`,
        JSON.stringify(_.uniq(_.concat(stashed, newStash)))
      );
    }
  },

  deactivate() {
    this.subscriptions.dispose();
  }

};
