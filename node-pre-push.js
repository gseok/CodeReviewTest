#!/usr/bin/env node

/**
# An example hook script to verify what is about to be pushed.  Called by "git
# push" after it has checked the remote status, but before anything has been
# pushed.  If this script exits with a non-zero status nothing will be pushed.
#
# This hook is called with the following parameters:
#
# $1 -- Name of the remote to which the push is being done
# $2 -- URL to which the push is being done
#
# If pushing without using a named remote those arguments will be equal.
#
# Information about the commits which are being pushed is supplied as lines to
# the standard input in the form:
#
#   <local ref> <local sha1> <remote ref> <remote sha1>
#
# This sample shows how to prevent push of commits where the log message starts
# with "WIP" (work in progress).
**/

// exit function
function exit() {
    process.exit(0);
}

// module require
var fs=require('fs');
var spawn = require('child_process').spawn;
var https = require('https');
var querystring = require('querystring');

// get arguments
var args = process.argv.slice(2);
var remote = args[0];
var url = args[1];

// get stdin data
var stdin = fs.readFileSync('/dev/stdin').toString().split('\n');
var local_ref = stdin[0];
var local_sha = stdin[1];
var remote_ref = stdin[2];
var remote_sha = stdin[3];

// get git commit information, git show --stat $local_sha
var gitShowStat = spawn('git', ['show', '--stat', local_sha]);

gitShowStat.stdout.on('data', function (data) {
    var newCommit = data.toString('utf-8');
    var title =    'New commit is pushed\n';
    var subTitle = 'remote(' + remote + '), ' + 'url(' + url + ')\n';
    var dim =      '----------------------------------------------\n';
    
    // create message
    var message = title + subTitle + dim + newCommit;

    // send message to bot
    // https://4kgwljo67l.execute-api.ap-northeast-1.amazonaws.com/prod/localGerritPushToTelegram
    var text = {
        text: message
    };
    var post_data = JSON.stringify(text);
    console.log(post_data);

    var options = {
        host: '4kgwljo67l.execute-api.ap-northeast-1.amazonaws.com',
        path: '/prod/localGerritPushToTelegram',
	method: 'POST',
	headers: {
            'x-api-key': '5PWa04DpzE9riyNktLtcO525Pcs2a0nb5KUdvypw',
	    'Content-Length': Buffer.byteLength(post_data)
	}
    };

    var req = https.request(options, function(res) {
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
            exit();
	});
    });

    req.write(post_data);
    req.end();

    req.on('error', function(e) {
        console.log('error', e);

        // exit
        exit();
    });
});

gitShowStat.stderr.on('data', function (data) {
    console.log('error', data.toString('utf-8'));
    exit();
});

