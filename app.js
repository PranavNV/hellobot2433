var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');
var util = require('util');
var request = require('request');
var http = require('http');

var connector = new builder.ChatConnector({
    appId: '',
    appPassword: ''
});
var bot = new builder.UniversalBot(connector);
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, 'localhost', function() {
    console.log('%s listening to %s', server.name, server.url);
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.jsonp());
server.use(restify.bodyParser({
    mapParams: false
}));
server.post('/api/messages', connector.listen());

bot.dialog('/', [function(session) {
    session.send('' + 'Hello, Welcome to the Aerospace PDM. I am your virtual assistant.');
    builder.Prompts.choice(session, 'Please select any of the options 1, 2 or 3', "Get Training on NGPDM|Have a question regarding NGPDM (FAQs)|Raise a Support Request");
}, function(session, results) {
	
    switch (results.response.entity) {
	  
        case "Get Training on NGPDM":
            session.replaceDialog("/1Dialog");
            break;
        case "Have a question regarding NGPDM (FAQs)":
			
			builder.Prompts.text(session, 'Please specifc your question token');
			break;
        case "Raise a Support Request":
            session.replaceDialog("/3Dialog");
            break;
        default:
            session.replaceDialog("/");
            break;
    }
}, function(session, results){
	session.userData.name = results.response;	
	session.replaceDialog("/ngpdmOpenQuery");	
}]);

bot.dialog('/ngpdmOpenQuery', [function(session) {
	if( session.userData.name != null ) 
	{
		//TODO 
		/*
			Our logic to continue or stop the open query url calls
		*/
	var ngpdmUrlPrefix = "http://10.10.6.77:5000/_analyse?question=";
	var ngpdmUrl = ngpdmUrlPrefix+ session.userData.name;
	console.log("GET " + ngpdmUrl);
    var request = require('request');
  
    request.post({
        url: ngpdmUrl,
        headers: {
            "Content-Type": "application/JSON"
        }
    }, function(err, httpResponse, body) {
        if (err) {
            session.send('Failed to add your request:', err);
            return console.error('Failed to add your request:', err);
        }
		else{
        var resultJSON = JSON.parse(body);
		builder.Prompts.choice(session, 'Please select any of the option.', resultJSON.result);	
		}
    });

	}
    	
},function(session, results) {
	
	session.userData.name = results.response;
	session.replaceDialog("/ngpdmOpenQuery");

}]);


bot.dialog('/1Dialog', [function(session) {
    builder.Prompts.choice(session, 'Please select any of the options 1, 2 or 3', "List NGPDM Trainings|Suggest new Trainings|Find NGPDM Expert");
}, function(session, results) {
    switch (results.response.entity) {
        case "List NGPDM Trainings":
            session.replaceDialog("/1_1Dialog");
            break;
        case "Suggest new Trainings":
            session.replaceDialog("/1_2Dialog");
            break;
        case "Find NGPDM Expert":
            session.replaceDialog("/1_3Dialog");
            break;
        default:
            session.replaceDialog("/");
            break;
    }
}]);
bot.dialog('/1_1Dialog', [function(session) {
    session.send('' + 'Please select a Training from below list [1, 2 or 3]');
}]);
bot.dialog('/1_2Dialog', [function(session) {
    session.send('' + 'Please provide the new Training name and details');
    session.send('' + 'Thank You for your inputs. We have notified the PDM team about your training suggestion. They will notify you on the action.');
}]);
bot.dialog('/1_3Dialog', [function(session) {
    session.send('' + 'Provide List of Module Names and Experts Names');
}]);
  
bot.dialog('/2_1Dialog', [function(session) {
    session.send('' + 'Please specifc your question');
    builder.Prompts.choice(session, 'Please select the area in which your problem is related to', "Option 1|Option 2");
}, function(session, results) {
    switch (results.response.entity) {
        case "Option 1":
            session.replaceDialog("/2_1_1Dialog");
            break;
        case "Option 2":
            session.replaceDialog("/2_1_2Dialog");
            break;
        default:
            session.replaceDialog("/");
            break;
    }
}]);
bot.dialog('/2_1_1Dialog', [function(session) {
    session.send('' + 'If you are satisfied with the response, please reply by entering 7; else reply by entering 0 or press 1/2/3 to view rest of the answers');
}]);
bot.dialog('/2_1_2Dialog', [function(session) {
    session.send('' + 'We have notified your question to the Expert. We will add the answer to your query shortly to our FAQ.');
}]);
bot.dialog('/3_3Dialog', [function(session) {
    builder.Prompts.choice(session, 'Please select any of the options 1, 2 or 3', "Report an Issue|Suggest new feature or Idea |Talk to Support Staff");
}, function(session, results) {
    switch (results.response.entity) {
        case "Report an Issue":
            session.replaceDialog("/3_1Dialog");
            break;
        case "Suggest new feature or Idea ":
            session.replaceDialog("/3_2Dialog");
            break;
        case "Talk to Support Staff":
            session.replaceDialog("/3_3Dialog");
            break;
        default:
            session.replaceDialog("/");
            break;
    }
}, function(session, results) {
    session.send('' + 'Provide List of Function Names and Contact Names');
}]);
bot.dialog('/3_1Dialog', [function(session) {
    session.send('' + 'Please specify the Issue');
    session.send('' + 'Your Issue is reported to the Support Team. The JIRA Ticket number is #####. You will be informed about the status shortly.\n\nContact [support distribution email list] for any urgent support.');
}]);
bot.dialog('/3_2Dialog', [function(session) {
    session.send('' + 'Please specifc new feature or Idea');
    session.send('' + 'Thank you for suggestion. The team is notified and you will be informed about the status shortly.');
    session.send('' + 'We have notified the Team about your suggestion. \n\nContact [support distribution email list] for any urgent support.');
}]);
