# git-tab-manager package
[![apm](https://img.shields.io/apm/v/git-tab-manager.svg?style=flat-square)](https://atom.io/packages/git-tab-manager)

An Atom plugin to close and re-open tabs as you change branches.

While this certainly isn't a fork of [git-tabs](https://github.com/dbslone/git-tabs),
git-tabs came first and is based off of the same idea, so I figured it would be
polite to mention them.

**git-tab-manager** keeps track of the Git Repo(s) for all of your open projects.
Whenever one of your repos changes branches, it does two things:
* Close any tabs you had open to files which don't exist on the current branch
* Re-open tabs for any files that **git-tab-manager** closed previously, if those files do exist on the current branch

## Known Issues:
* **git-tab-manager** will automatically close tabs if the file no longer exists, even if you had unsaved work in that tab.
  In the future, I plan to have **git-tab-manager** keep track of the modification state of files so that it only closes files
  which were saved prior to changing branches.
