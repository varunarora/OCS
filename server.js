var _ = require('underscore'),
    fs = require('fs'),
    spawn = require('child_process').spawn;

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 1337});

var documentHeader = _.template('<html><body><h2><%= title %></h2>'),
    documentFooter = _.template('</body></html>');

wss.on('connection', function(ws){
    ws.on('message', function(message){
        var acknowledgement = {
            documentReceived: true
        };
        ws.send(JSON.stringify(acknowledgement));
        
        // Now process the PDF.
        data = JSON.parse(message);

        // Use underscore templates to build the HTML page.
        htmlDocument = documentHeader(data.document);
        var elements = data.document.elements;

        var i, currentElement;
        for (var key in elements){
            if (elements.hasOwnProperty(key)){
                htmlDocument += elements[key];
            }
        }
        htmlDocument += documentFooter();

        // Write the HTML page using Node utils.
        fs.writeFile('document.html', htmlDocument, function(err){
            if (err){
                console.log('File did not save');
            } else {
                var exporter;
                if (data.type == 'pdf'){
                    // Run PDF generator.
                    exporter = spawn('python', ['export-pdf.py']);
                } else {
                    exporter = spawn('python', ['export-word.py']);
                }

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

var http = require("http"),
    url = require("url"),
    qs = require('querystring');

function renderDoc(url, callback){
    var exporter = spawn('python', ['render-pdf.py', url]);

    exporter.stdout.on('data', function(data){
        var exportUrl = data.toString().trim();

        console.log(exportUrl);

        if (exportUrl.substring(0, 4) ===  'http'){
            var success = {
                documentProcessed: true,
                url: exportUrl
            };
            callback(JSON.stringify(success));
        }}
    );

    exporter.stderr.on('data', function(data){
        console.log(data.toString());
    });
}

function onRequest(request, response) {
    path = url.parse(request.url).pathname;

    if (path === '/render' && request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            if (body.length > 1e6)
                req.connection.destroy();
        });
        request.on('end', function () {
            var post = qs.parse(body);

            // use post['blah'], etc.
            renderDoc(post['url'], function(message){
                response.writeHead(200, {"Content-Type": "application/json"});
                response.write(message);
                response.end();
            });
        });
    }


}

http.createServer(onRequest).listen(8888);

console.log('Server running at http://127.0.0.1:1337/');