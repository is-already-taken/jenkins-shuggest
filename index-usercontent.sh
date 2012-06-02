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
        # shuggest.consumes=Description what this script consumes
        # shuggest.produces=Description what this script produces

Options
    find options      Options to narrow find's search results.
                      You could for example exclude test.sh with

                          $ $BINNAME ! -name "test.sh"

EOH
}


function get_prop(){
	cat $USERCONTENT_PATH/$F | grep "$1" | sed 's+^.*#[^=]*=\(.*\)$+\1+'
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


GLOBBING_OFF=0
if [[ $- =~ f ]]; then
	GLOBBING_OFF=1
fi

set -f

ARGS=""
for ARG in $@; do
	if [[ "$ARG" =~ ^-.* ]]; then
		ARGS="$ARGS $ARG"
	else
		ARGS="$ARGS '$ARG'"
	fi
done

if [ $GLOBBING_OFF -eq 0 ]; then
	set +f
else
	set -f
fi

JSON="["

for F in `eval "find $USERCONTENT_PATH -type f $ARGS ! -name readme.txt ! -name index.json ! -name $BINNAME 2>/dev/null | sed 's+.*userContent/++g'"`; do
	DESCR="`get_prop 'shuggest.descr'`"
	USAGE="`get_prop 'shuggest.usage'`"
	CONS="`get_prop 'shuggest.consumes'`"
	PROD="`get_prop 'shuggest.produces'`"

	JSON="$JSON{"path": \"$F\", "description": \"$DESCR\", "usage": \"$USAGE\", "consumes": \"$CONS\", "produces": \"$PROD\"},"
done

JSON="`echo $JSON | sed 's+,$++'`]"

echo "$JSON" > $INDEX_FILENAME

echo "$INDEX_FILENAME written."
