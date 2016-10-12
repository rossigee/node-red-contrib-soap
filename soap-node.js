module.exports = function (RED) {
    function SoapCall(n) {
        var soap = require('soap');
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.name = n.name;
        this.wsdl = n.wsdl;
        if (n.wsdlUrl){
            this.server = {wsdl:n.wsdlUrl, auth: 0};
        } else {
            this.server = RED.nodes.getNode(this.wsdl);
        }
        this.method = n.method;
        this.payload = n.payload;
        this.headers = n.headers;
        this.wsdlOptions = n.wsdlOptions;
        var node = this;
        try {
            node.on('input', function (msg) {
                soap.createClient(node.server.wsdl, msg.wsdlOptions || {}, function (err, client) {
                    if (err) {
                        node.status({fill: "red", shape: "dot", text: "WSDL Config Error: " + err});
                        node.error("WSDL Config Error: " + err);
                        return;
                    }
                    switch (node.server.auth) {
                        case '1':
                            client.setSecurity(new soap.BasicAuthSecurity(node.server.user, node.server.pass));
                            break;
                        case '2':
                            client.setSecurity(new soap.ClientSSLSecurity(node.server.key, node.server.cert, {}));
                            break;
                        case '3':
                            client.setSecurity(new soap.WSSecurity(node.server.user, node.server.pass));
                            break;
                        case '4':
                            client.setSecurity(new soap.BearerSecurity(node.server.token));
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
