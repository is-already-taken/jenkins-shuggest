# Shuggest

Shuggest is a modest script that displays a tooltip under each shell script 
textarea on a job configuration page showing all available files (scripts) 
(with description too)  in your userContent directory. A item can be clicked 
to put the full qualified path into the textarea. You can also hover info 
"icons" to get more information. The magic will be described below.

The word [ʃhu'ɡest] is a combination of shell and suggest.  :)

## Features

* Display the script name
* Display information such as description, usage, requires when hovering a icon
* On click the shell command is pasted into the textarea
* Tooltip is already open (might be considered as a bug though ;) ...
* ... but can be close although
* Is not only limited to scripts (though it's its most likely usage, I think)

## The magic

The extension needs a index file which shows the file names available. The index
file has to be placed within the userContent/ directory. There's a shellscript 
that will generate this index file for you.

Scripts may contain comments with key=value definitions for description, usage 
and requirements such as follows.

```
# shuggest.descr=This script makes CI working like a charm
# shuggest.usage=<Param A> [<Param B>]
# shuggest.requires=Env-Var VARIABLE, File: file.txt, Some plugin
```

You will run this index script once after changing your files (shell scripts).

```
$ index-usercontent.sh

$ index-usercontent.sh -name "*.sh" ! -name "test.sh"
```

And as you can see, you can also use find options to filter your files.

## Requirements

* [Jenkins jQuery Plugin](https://wiki.jenkins-ci.org/display/JENKINS/jQuery+Plugin)
* [Jenkins Page Markup Plugin](https://wiki.jenkins-ci.org/display/JENKINS/Page+Markup+Plugin)
* JENKINS_HOME has to be defined

## Tips

In my environment I put all my assistance scripts into a Git repository.  
A dedicated job will clone the repository and copy the files into the 
userContent directory. As a second build step I call the index script to update
the index. 

## License 

This code is MIT licensed for you.
