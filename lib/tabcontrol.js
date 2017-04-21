'use babel';

import * as _ from 'lodash';
import * as fs from 'fs';
import {CompositeDisposable} from 'atom';

export class TabControl {
  subscritions = null;
  active = false;

  constructor() {
    this.subscriptions = new CompositeDisposable();
    let _this = this;
    Promise.all(atom.project.getDirectories().map(
      atom.project.repositoryForDirectory.bind(atom.project)
    ))
    .then(function(repos){
      _.forEach(repos, function(repo){
        if (repo !== null)
        {
          active = true; //something about watching atom.workspace.observeTextEditors()
          atom.notifications.addSuccess(
            "Git-Tab-Manager observing repository: "+repo.path
          );
          window.localStorage.setItem(`git-tab-manager/${repo.path}/branch`, repo.getShortHead());
          _this.subscriptions.add(
            repo.onDidChangeStatuses(_.bind(_this.updateTabs, _this, repo))
          );
          _this.updateTabs(repo);
        }
      });
      //that part where you remember ES6's nifty function shorthand
      if (active) {
        atom.workspace.observeTextEditors((editor)=>{
          editor.onDidStopChanging(()=>{
            window.localStorage.setItem(
              `git-tab-manager/${editor.getPath()}/state`,
              fs.existsSync(editor.getPath()) && editor.isModified()
            );
          });
        });
      }
    })
  }

  updateTabs(repo)
  {
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
      _.forEach(atom.workspace.getTextEditors(), function(editor){
        let path = editor.getPath();
        let state = !window.localStorage.getItem(`git-tab-manager/${editor.getPath()}/state`);
        console.log(`The state for ${editor.getPath()} is`, state);
        if (_.isString(path) && state)
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
  }

  updateEditor(editor) {
      let currentBranch = window.localStorage.getItem(`git-tab-manager/${repo.path}/branch`);
  }

  destroy() {
    this.subscriptions.destroy();
  }

}
