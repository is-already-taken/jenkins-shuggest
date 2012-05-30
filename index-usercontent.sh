#!/bin/bash

# Author Thomas Lehmann, May 2012
# 

USERCONTENT_PATH="${JENKINS_HOME}/userContent"
INDEX_FILENAME="index.json"

BINNAME="`basename $0`"

function help(){
	cat <<EOH
Generate index of Jenkins' userContent/ directory.

Usage: $BINNAME [<find options>]

Synopsis
    This script will generate a index of Jenkins userContent directory in form
    of a JSON file. The file can then be used the "shuggest" Userscript to show 
    a list of shell scripts that are executable in jobs next to a shell textarea.

    Script files may contain comments with a short description and usage text.

        # shuggest.descr=Description goes here
        # shuggest.usage=Usage goes here
        # shuggest.requires=Description of requires Env variables or
                               files goes here

Options
    find options      Options to narrow find's search results.
                      You could for example exclude test.sh with

                          $ $BINNAME ! -name "test.sh"

EOH
}

if [[ $1 =~ ^-(-help|h|\?)$ ]]; then
	help
	exit 0
fi

if [ -z "${JENKINS_HOME}" ]; then
	echo "JENKINS_HOME not set. Are you Jenkins user? Try whoami or check your shell."
	exit 1
fi

if [ ! -d "${JENKINS_HOME}" ]; then
	echo "JENKINS_HOME does not point to a directory. Check your Jenkins setup."
	exit 1
fi

if [ ! -d $USERCONTENT_PATH ]; then
	echo "Jenkins userContent is not a directory or not existing: $USERCONTENT_PATH" >/dev/stderr
	exit 1
fi

FIND_OPTS="$*"


JSON="["

for F in `find $USERCONTENT_PATH -type f ! -name "readme.txt" ! -name "index.json" $FIND_OPTS | sed 's+.*userContent/++g' 2>/dev/null`; do 
	DESCR="`cat $USERCONTENT_PATH/$F | grep 'shuggest.descr' | sed 's+^#[^=]*=\(.*\)$+\1+' | sed 's+"+\\\\"+g'`"
	USAGE="`cat $USERCONTENT_PATH/$F | grep 'shuggest.usage' | sed 's+^#[^=]*=\(.*\)$+\1+' | sed 's+"+\\\\"+g'`"
	REQ="`cat $USERCONTENT_PATH/$F | grep 'shuggest.requires' | sed 's+^#[^=]*=\(.*\)$+\1+' | sed 's+"+\\\\"+g'`"

	JSON="$JSON{"path": \"$F\", "description": \"$DESCR\", "usage": \"$USAGE\", "requires": \"$REQ\"},"
done

JSON="`echo $JSON | sed 's+,$++'`]"

echo "$JSON" > $INDEX_FILENAME

echo "$INDEX_FILENAME written."
