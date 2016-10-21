# node-red-contrib-soap
Node-red component for call SOAP services

##Functions
* Node for call SOAP Service.

## input parameters :
* msg.wsdlUrl : set wsdl url (unauthentified) directly from input
* msg.wsdlOptions : set wsdl options passed directly to soap module
* msg.headers : add soap headers to soap client
  -> see https://www.npmjs.com/package/soap for headers and options format
