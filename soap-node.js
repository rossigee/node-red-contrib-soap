module.exports = function (RED) {
    function SoapCall(n) {
        var soap = require('soap');
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.name = n.name;
        this.wsdl = n.wsdl;
        this.server = RED.nodes.getNode(this.wsdl);
        this.method = n.method;
        var node = this;
        try {
            node.on('input', function (msg) {
                var server = node.server;
                if (msg.wsdlUrl){
                    server = {wsdl: msg.wsdlUrl, auth: 0};
                }
                soap.createClient(server.wsdl, msg.wsdlOptions || {}, function (err, client) {
                    if (err) {
                        node.status({fill: "red", shape: "dot", text: "WSDL Config Error: " + err});
                        node.error("WSDL Config Error: " + err);
						msg.payload = "Soap Module WSDL config error : " + err;
						node.send(msg);
						return;
                    }
                    switch (server.auth) {
                        case '1':
                            client.setSecurity(new soap.BasicAuthSecurity(server.user, server.pass));
                            break;
                        case '2':
                            client.setSecurity(new soap.ClientSSLSecurity(server.key, server.cert, {}));
                            break;
                        case '3':
                            client.setSecurity(new soap.WSSecurity(server.user, server.pass));
                            break;
                        case '4':
                            client.setSecurity(new soap.BearerSecurity(server.token));
                            break;
                    }
                    node.status({fill: "green", shape: "dot", text: "SOAP Request..."});
                    if (msg.headers){
                        client.addSoapHeader(msg.headers);
                    }
                    client[node.method](msg.payload, function (err, result) {
                        if (err) {
                            node.status({fill: "red", shape: "dot", text: "Service Call Error: " + err});
                            node.error("Service Call Error: " + err);
							msg.payload = "Soap Module Service call error : " + err;
							node.send(msg);
                            return;
                        }
                        node.status({});
                        msg.payload = result;
                        node.send(msg);
                    });
                });
            });
        } catch (err) {
            node.status({fill: "red", shape: "dot", text: err.message});
            node.error(err.message);
        }
    }
    RED.nodes.registerType("soap request", SoapCall);
};
