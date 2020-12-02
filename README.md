Scan your directory for git repositories displaying path, git branch and the status of it.

Based on [git-unsaved](https://github.com/IonicaBizau/git-unsaved). 

You can install the package globally and use it as command line tool:

```sh
# Using npm
npm install --global scan-git-repo

# Using yarn
yarn global add scan-git-repo
```


Then, run `scan-git-repo --help` and see what the CLI tool can do.


```
$ scan-git-repo --help
Usage: scan-git-repo [options]

Scan your projects directory for dirty git repositories.

Options:
  -r, --relative-paths  Display the relative paths.
  -p, --path <path>     A custom folder path (default: the current working
                        directory).
  -h, --help            Displays this help.
  -v, --version         Displays version information.

Examples:
    scan-git-repo                   # Scans the current directory
    scan-git-repo -p ~/projects     # Scans the projects directory
    scan-git-repo -a                # Display absolute paths
```
