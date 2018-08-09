//Bluebird is a fully featured promise library with focus on innovative features and performance
var Promise = require('bluebird');

var BrandOptions = [
    "CHOAM",
    "Acme Corp.",
    "Sirius Cybernetics Corp.",
    "MomCorp",
    "Rich Industries",
    "Soylent Corp.",
    "Very Big Corp.of America",
    "Frobozz Magic Co.",
    "Warbucks Industries",
    "Tyrell Corp.",
    "Wayne Enterprises",
    "Virtucon",
    "Globex",
    "Umbrella Corp.",
    "Wonka Industries",
    "Stark Industries",
    "Clampett Oil",
    "Oceanic Airlines",
    "Yoyodyne Propulsion Sys.",
    "Cyberdyne Systems Corp.",
    "d’Anconia Copper",
    "Gringotts",
    "Oscorp",
    "Nakatomi Trading Corp.",
    "Spacely Space Sprockets"];

var GoalOptions = [
    "Increase Sales",
    "Develop Brand Awareness",
    "Gain New Customers",
    "Enhance Internal Communications",
    "Increase Profit",
    "Raise Traffic",
    "Boost Customer Relationships",
    "Explore New Markets",
    "Build Reputation",
    "Launch New Products or Services"];

var CountryOptions = [
    "US",
    "EMEA",
    "LATIN",
    "GB",
    "FR",
    "CA"];

var AudienceOptions = [
    "Gender",
    "Age",
    "Income",
    "Education",
    "Marital Status",
    "Race",
    "Household Size"];

module.exports = {
    searchCampaign: function (campaignResults) {
        return new Promise(function (resolve) {
            var startDate = dateRandomGenerator(300, 8, 23);
            var campaign = [];
            campaign.push({
                brand: BrandOptions[Math.floor(Math.random() * BrandOptions.length)],
                goal: GoalOptions[Math.floor(Math.random() * GoalOptions.length)],
                geography: CountryOptions[Math.floor(Math.random() * CountryOptions.length)],
                audience: AudienceOptions[Math.floor(Math.random() * AudienceOptions.length)],
                startDate: startDate
            });

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(campaign); }, 1000);
        });
    },
};
