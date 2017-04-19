'use babel';

import * as _ from 'lodash';
import * as fs from 'fs';
import {CompositeDisposable} from 'atom';

export class TabControl {
  subscritions = null;

  constructor() {
    this.subscriptions = new CompositeDisposable();
    Promise.all(atom.project.getDirectories().map(
      atom.project.repositoryForDirectory.bind(atom.project)
    ))
    .then(function(repos){
      _.forEach(repos, function(repo){
        if (repo !== null)
        {
          atom.notifications.addSuccess(
            "Git-Tab-Manager observing repository: "+repo.path
          );
          window.localStorage.setItem(`git-tab-manager/${repo.path}/branch`, repo.getShortHead());
          this.subscriptions.add(
            repo.onDidChangeStatuses(_.partial(this.updateTabs, repo))
          );
          this.updateTabs(repo);
        }
      });
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
  }

  destroy() {
    this.subscriptions.destroy();
  }

}
