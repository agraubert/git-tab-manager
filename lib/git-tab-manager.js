'use babel';

import {forEach, bind, isString, pull, remove, uniq, concat} from 'lodash';
import * as fs from 'fs';

export default {
  
  config: {
    someSetting: {
      title: "Test Setting",
      description: "It's a setting",
      type: "integer",
      value: 4
    }
  },

  ready: false,

  activate(state) {
    console.log("Heyo");
    let _this = this;
    Promise.all(atom.project.getDirectories().map(
      atom.project.repositoryForDirectory.bind(atom.project)
    ))
      .then(function(repos){
        forEach(repos, function(repo){
          if (repo !== null)
          {
            atom.notifications.addSuccess(
              "Git-Tab-Manager observing repository: "+repo.path
            );
            window.localStorage.setItem(`git-tab-manager/${repo.path}/branch`, repo.getShortHead());
            repo.onDidChangeStatuses(bind(_this.updateTabs, _this, repo));
          }
        });
        _this.ready = true;
      })
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
      forEach(atom.workspace.getTextEditors(), function(editor){
        let path = editor.getPath();
        if (isString(path))
        {
          pull(stashed, path);
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
      remove(stashed, function(path){
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
        JSON.stringify(uniq(concat(stashed, newStash)))
      );
    }
  },

};
