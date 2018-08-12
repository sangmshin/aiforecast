'use strict';

/**
 * This file contains a map of messages used by the skill.
 */

const WELCOME = "Welcome to A.I. Forecast. ";
//const WELCOME = "Welcome to Who's in charge here. ";

const WHAT_DO_YOU_WANT = "Would you like to listen to Artificial Intelligence news and weather forecast? Say yes or no.  ";

const NOTIFY_MISSING_PERMISSIONS = "Please enable Location permissions in the Amazon Alexa app.";

const NO_ADDRESS = "It looks like you don't have an address set. You can set your address from the Amazon Alexa app.";

const ADDRESS_AVAILABLE = "Here is your full address: ";

const ERROR = "Uh Oh. Looks like something went wrong.";

const LOCATION_FAILURE = "There was an error with A.I. Forecast. Please try again.";

const GOODBYE = "Good bye! Thanks for using A.I. Forecast Skill!";

const UNHANDLED = "This skill doesn't support that. Please say yes or no.";

const HELP = "You can say yes or no.";

const STOP = "There is nothing to stop. Did you mean to ask something else?";

module.exports = {
    "WELCOME": WELCOME,
    "WHAT_DO_YOU_WANT": WHAT_DO_YOU_WANT,
    "NOTIFY_MISSING_PERMISSIONS": NOTIFY_MISSING_PERMISSIONS,
    "NO_ADDRESS": NO_ADDRESS,
    "ADDRESS_AVAILABLE": ADDRESS_AVAILABLE,
    "ERROR": ERROR,
    "LOCATION_FAILURE": LOCATION_FAILURE,
    "GOODBYE": GOODBYE,
    "UNHANDLED": UNHANDLED,
    "HELP": HELP,
    "STOP": STOP
};