# Shuggest

Shuggest is a modest script that displays a tooltip under each shell script textarea on a job configuration page showing all available files e.g. scripts (with description too, for that see below) in your userContent directory. An item can be clicked to put the full qualified path into the textarea. You can also hover info "icons" to get more information. The magic will be described below.

The word [ʃʊ'ɡest] is a combination of shell and suggest.  :)

## Features

* Display the script name and shot description
* Detailed information (usage, consumes and produces) is opened when clicking on "more ..."
* On click the shell command is pasted into the textarea
* The tooltip is initially open (might be considered as a bug though ;) ...
* ... but can be close although
* Is not only limited to scripts (though it's its most likely usage, I think)

## The magic

The extension needs an index file which shows the file names available. The index file has to be placed within the userContent/ directory. There's a shellscript that will generate this index file for you.

Scripts may contain comments with key=value definitions for description, usage and requirements such as follows.

```
# shuggest.descr=This script makes CI working like a charm
# shuggest.usage=<Param A> [<Param B>]
# shuggest.consumes=Env-Var VARIABLE, File: file.txt, Some plugin
# shuggest.produces=output.file
```

You will run this index script once after changing your files (shell scripts).

```
$ index-usercontent.sh

$ index-usercontent.sh -name "*.sh" ! -name "test.sh"
```

And as you can see, you can also use find options to filter your files.

## How to install

First, install the required plugins. Then put the shuggest.js and .css into your userContent directory add the following lines to the "Footer HTML" textarea on the System configuration page:  

```
<link rel="stylesheet" type="text/css" href="/userContent/shuggest.css" />
<script type="text/javascript" src="/userContent/shuggest.js"></script>
```

## Requirements

* [Jenkins jQuery Plugin](https://wiki.jenkins-ci.org/display/JENKINS/jQuery+Plugin)
* [Jenkins Page Markup Plugin](https://wiki.jenkins-ci.org/display/JENKINS/Page+Markup+Plugin)
* JENKINS_HOME has to be defined

## Tips

In my environment I put all my assistance scripts into a Git repository. A dedicated job will clone the repository and copy the files into the userContent directory. As a second build step I call the index script to update the index. 

## License 

This code is MIT licensed for you.
