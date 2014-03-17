var _ = require('underscore'),
    fs = require('fs'),
    spawn = require('child_process').spawn;

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 1337});

/*
var documentHeader = _.template('<html><body><h2><%= title %></h2>'),
    documentFooter = _.template('</body></html>');
*/
wss.on('connection', function(ws){
    ws.on('message', function(message){
        var acknowledgement = {
            documentReceived: true
        };
        ws.send(JSON.stringify(acknowledgement));

		// Make the questions into a valid TeX document.
		message = '\\documentclass{article}\n\\usepackage{amsmath}\n\\let\\columnlines\\empty\n\\raggedleft\n\\begin{document}\n' + message + '\n\\end{document}'

        // Write the HTML page using Node utils.
        fs.writeFile('document.tex', message, function(err){
            if (err){
                console.log('File did not save');
            } else {
                exporter = spawn('python', ['export-worksheet-word.py']);

                exporter.stdout.on('data', function(data){
                    var exportUrl = data.toString().trim();

                    console.log(exportUrl);

                    if (exportUrl.substring(0, 4) ===  'http'){
                        var success = {
                            documentProcessed: true,
                            url: exportUrl
                        };
                        ws.send(JSON.stringify(success));
                    }
                });

                exporter.stderr.on('data', function(data){
                    var failure = {
                        documentProcessed: false
                    };
                    ws.send(JSON.stringify(failure));
                });
            }
        });
    });
});

console.log('Server running at http://127.0.0.1:1337/');
