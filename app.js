
var builder = require('botbuilder');
var restify = require('restify');
var locationDialog = require('botbuilder-location');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId:process.env.MICROSOFT_APP_ID,
    appPassword:process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.library(locationDialog.createLibrary('As2XdBj3H8TVBvXl6tmBu5nF2rTz5cnUtCb4UK4dr3_zWOEUREyQhZz6RpI3UQfB'));

bot.dialog('/', function (session) {
    session.send('Hi! This is Fitbot. Your personal fitness assistant :)');
	session.beginDialog('/profile');
});



















bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Heyo! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.replaceDialog('/step1');
    }
]);



bot.dialog('/step1', [function(session) {
    session.send('Hello %s I am your virtual assistant for today!',session.userData.name);
    builder.Prompts.choice(session, 'What are you looking for?', "What is Sweatwell all about?|Have a question regarding the training sessions-FAQs|Want to contact an expert?|Wanna to order our special goodies and material?");
}, function(session, results) {
	
    switch (results.response.entity) {
	  
        case "What is Sweatwell all about?":
            session.replaceDialog("/About");
            break;
        case "Have a question regarding the training sessions-FAQs":
			
			session.replaceDialog("/FAQs");
			break;
        case "Want to contact an expert?":
            session.replaceDialog("/Contacts");
            break;
        case "Wanna to order our special goodies and material?":
            session.replaceDialog("/map");
            break;
        default:
            session.replaceDialog("/stepbye");
            break;
    }
}, function(session, results){
	session.userData.name = results.response;	
	session.replaceDialog("/stepbleh");	
}]);



bot.dialog('/About', function (session) {
    session.send('Our main purpose is to find the right fitness plan for you and also the right trainer to guide you in your path to getting your body into perfect shape!');
	session.send('Check out all the amazing events that are occuring around you and also keep a live tracker on your workout schedule');
	session.beginDialog('/step1');
});

bot.dialog('/Contacts', function (session) {
    session.send('One moment %s,I will just fetch you the contact you are looking for...',session.userData.name);
	session.send('Name: Harsh Ragav');
    session.send('Designation: Tech Support');
    session.send('Phone number: 9786274937');
    session.send('Email ID: harshragav@sweatwell.com');
	session.beginDialog('/step1');
});




bot.dialog('/FAQs', [function(session) {
    session.send('Hello %s I am your virtual assistant for today!',session.userData.name);
    builder.Prompts.choice(session, 'Here are the most common queries we encountered', "What types of fitness plans are available?|Can I be both a trainer and a fitness seeker?|How are trainers selected for a fitness seeker?|Who rates the trainiers?");
}, function(session, results) {
	
    switch (results.response.entity) {
	  
        case "What types of fitness plans are available?":
            session.send('There are mainly three types of fitness plans:');
			session.send('1.Weight Loss Plan');
			session.send('2.Muscle Gain Plan');
			session.send('3.Stay Fit Plan');
			session.replaceDialog("/stepbye");
            break;
        case "Can I be both a trainer and a fitness seeker?":
			session.send('No.');
			session.replaceDialog("/stepbye");
			break;
        case "How are trainers selected for a fitness seeker?":
            session.send('We select the best trainier in your vicinity by the preference that  you have mentioned and also mainly by your BMI value');
			session.replaceDialog("/stepbye");
            break;
		case "Who rates the trainiers?":
		    session.send('The fitness seekers rate the trainers as per their experiences');
            session.replaceDialog("/stepbye");
            break;
        default:
            session.replaceDialog("/step1");
            break;
    }
}, function(session, results){
	session.userData.name = results.response;	
	session.replaceDialog("/stepbleh");	
}]);





bot.dialog('/stepbleh', function (session) {
    session.send('I did not understand what you were trying to say. Lets start this over now...');
	session.endConversation();
});


bot.dialog('/stepbye', function (session) {
    session.send('Hope I was of help! Thank you and see you soon!!! :)');
	session.endConversation();
});




bot.library(locationDialog.createLibrary('As2XdBj3H8TVBvXl6tmBu5nF2rTz5cnUtCb4UK4dr3_zWOEUREyQhZz6RpI3UQfB'));

bot.dialog("/map", [
    function (session) {
        var options = {
            prompt: "Where should I ship your order?",
            useNativeControl: true,
            reverseGeocode: true,
			skipFavorites: false,
			skipConfirmationAsk: true,
            requiredFields:
                locationDialog.LocationRequiredFields.streetAddress |
                locationDialog.LocationRequiredFields.locality |
                locationDialog.LocationRequiredFields.region |
                locationDialog.LocationRequiredFields.postalCode |
                locationDialog.LocationRequiredFields.country
        };

        locationDialog.getLocation(session, options);
    },
    function (session, results) {
        if (results.response) {
            var place = results.response;
			var formattedAddress = 
            session.send("Thanks, I will ship to " + getFormattedAddressFromPlace(place, ", "));
        }
    }
]);

function getFormattedAddressFromPlace(place, separator) {
    var addressParts = [place.streetAddress, place.locality, place.region, place.postalCode, place.country];
    return addressParts.filter(i => i).join(separator);
};
