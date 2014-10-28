var util = require('./util');

/** Config */
casper.viewportSize = {width: 1440, height: 900};
var host = 'http://localhost:8080';

casper.test.begin('Index seems healthy', function suite(test) {
    casper.start(host, function () {
        test.assertExists("nav", "There is a nav");
        test.assertExists(".timer", "There is a timer");
        test.assertExists(".progress > .progress-bar", "There is a progress bar");
    }).run(function () {
        test.done();
    });
});

/** Registration */
casper.test.begin('Registration works with complete information', function suite(test) {
    casper.start(host + '/register', function () {
        this.fill("form[action='/register']", util.group, true);
        // Success brings us to account page.
    }).waitForUrl(/account$/, function () {
            test.assertUrlMatch(/account$/, "Sent to account page");
    }).run(function () {
        test.done();
    });
});

casper.test.begin('Registration fails with incomplete information', function suite(test) {
    casper.start(host + '/register', function () {
        var incomplete = util.group;
        delete incomplete.city;
        this.fill("form[action='/register']", incomplete, true);
        // Get redirected back, values should still be there.
    }).waitForUrl(/register\?message=/, function () {
            test.assertUrlMatch(/register\?message=/, "Redirected back to register page");
            test.assertField('address', util.group.address, "Filled-in values remain");
    }).run(function () {
        test.done();
    });
});

/** Login */
casper.test.begin('Login works with correct information', function suite(test) {
    casper.start(host + '/register', function () {
        this.fill("form[action='/login']", { email: util.group.email, password: util.group.password }, true);
    }).waitForUrl(/account$/, function () {
        // On success we get sent to the account page.
        test.assertUrlMatch(/account$/, "Sent to account page");
    }).run(function () {
        test.done();
    });
});

casper.test.begin('Login fails with incorrect information', function suite(test) {
    casper.start(host + '/register', function () {
        this.fill("form[action='/login']", { email: util.garbage(), password: util.garbage() }, true);
    }).waitForUrl(/register\?message/, function () {
        // Redirected due to invalid information.
        test.assertUrlMatch(/register\?message=/, "Sent back to login page");
    }).run(function () {
        test.done();
    });
});

/** Logout */
casper.test.begin('Logout works correctly', function suite(test) {
    casper.start(host + '/register', function () {
        this.fill("form[action='/login']", { email: util.group.email, password: util.group.password }, true);
    }).waitForUrl(/account/, function () {
        // Log out
        this.click("a[href='/logout']");
    }).waitForUrl(/\/$/, function () {
        // Should be logged out. Check the navbar items.
        test.assertDoesntExist("a[href='/logout']", "Logout removes Logout button");
        test.assertExists("a[href='/register']", "Logout re-introduces Register");
    }).run(function () {
        test.done();
    });
});

/** Account Page */
casper.test.begin('Account page functions correct', function suite(test) {
    casper.start(host + '/register', function () {
        this.fill("form[action='/login']", { email: util.group.email, password: util.group.password }, true);
    }).waitForUrl(/account$/, function () {
        // Youth In Care
        test.assertExists("#youthInCare button.btn.btn-danger > i.fa.fa-2x.fa-remove", "Youth in Care check is off");
        test.assertExists("#youthInCare form[action='/youthInCare']", "Form for YIC exists.");
        // Members
        test.assertExists("#members button.btn.btn-danger[disabled] > i.fa.fa-2x.fa-remove", "Members check is off, is disabled");
        test.assertExists("#members a[href='/member']", "Link to members section is present");
        test.assertExists("#members table", "Member table present");
        test.assertExists("#members #allowRemove", "Allow remove button is present");
        // Documents
        test.assertExists("#documents button.btn.btn-danger > i.fa.fa-2x.fa-remove", "Documents check is off");
        test.assertExists("#documents ul", "Document list is present");
        // Payments
        test.assertExists("#payments button.btn.btn-danger > i.fa.fa-2x.fa-remove", "Payments check is off");
        test.assertExists("#payments #cost", "Cost specification is present");
        test.assertExists("#payments #paid", "Paid specification is present");
        test.assertExists("#payments #balance", "Balance specification is present");
        // Workshops
        test.assertExists("#workshops button.btn.btn-danger > i.fa.fa-2x.fa-remove", "Workshops check is off");
    }).run(function () {
        test.done();
    });
});

/** Conduct Step */
casper.test.begin('Conduct Step', function suite(test) {
    casper.start(host + '/register', function () {
        this.fill("form[action='/login']", { email: util.group.email, password: util.group.password }, true);
    }).waitForUrl(/account$/, function () {
        test.assertExists("#conduct button.btn-danger > .fa-remove", "Conduct check is off");
        test.assertExists("#conduct a[href='/conduct']", "Link to conduct is present");
        this.click("#conduct a[href='/conduct']");
    }).waitForUrl(/conduct$/, function () {
        test.assertUrlMatch(/conduct$/, "On conduct page");
        test.assertExists("button#agree", "Agree button exists");
        this.click("button#agree");
    }).waitForUrl(/account$/, function () {
        test.assertUrlMatch(/account$/, "Button click redirects to account page");
        test.assertExists("#conduct button.btn-success > .fa-check", "Conduct is checked off");
        this.click("#conduct a[href='/conduct']");
    }).waitForUrl(/conduct$/, function () {
        test.assertExists("a[href='/account']", "After checking off, the conduct form just has a link");
    }).run(function () {
        test.done();
    });
});

/** Details Step */
casper.test.begin('Conduct Step', function suite(test) {
    casper.start(host + '/register', function () {
        this.fill("form[action='/login']", { email: util.group.email, password: util.group.password }, true);
    }).waitForUrl(/account$/, function () {
        test.assertExists("#details button.btn.btn-danger > i.fa.fa-2x.fa-remove", "Details check is off");
        test.assertExists("#details a[href='/details']", "Link to details section is present");
        this.click("#details a[href='/details']");
    }).waitForUrl(/details$/, function () {
        test.assertUrlMatch(/details$/, "Directed to details page");
    }).run(function () {
        test.done();
    });
});



//
