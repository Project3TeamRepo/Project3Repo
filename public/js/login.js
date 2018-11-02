class AccountForm {

    constructor(email, firstName, lastName, password) {
        this._email = escapeEmailAddress(email);
        this._firstName = firstName;
        this._lastName = lastName;
        this._password = AccountForm.hashPassword(password);
    }

    get email() {
        return this._email;
    }

    set email(value) {
        this._email = escapeEmailAddress(value);
    }

    get firstName() {
        return this._firstName;
    }

    set firstName(value) {
        this._firstName = value;
    }

    get lastName() {
        return this._lastName;
    }

    set lastName(value) {
        this._lastName = value;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = AccountForm.hashPassword(value);
    }

    static hashPassword(password) {
        return password.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    }

}

function validateEmailAddress(email) {
    if(email != null) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(re.test(String(email).toLowerCase())) {
            return [];
        } else {
            return ["Email address is invalid"];
        }
    } else {
        return ["Email address is required"];
    }
}

function validatePassword(password) {
    if(password != null) {
        let passwordValidation = [];

        if(password.length < 6) {
            passwordValidation.push("Password must be at least 6 characters long");
        }
        if(!(/[0-9]/.test(password))) {
            passwordValidation.push("Password must contain at least one number");
        }
        if(!(/[a-z]/).test(password)) {
            passwordValidation.push("Password must contain at least one lower case letter");
        }
        if(!(/[A-Z]/).test(password)) {
            passwordValidation.push("Password must contain at least one upper case letter");
        }
        return passwordValidation;
    } else {
        return ["Password is required"];
    }
}

function validateAccountFormInput(email, password) {
    let isEmailValid = validateEmailAddress(email);
    let isPasswordValid = validatePassword(password);

    return isEmailValid.concat(isPasswordValid);
}

function login() {
    let emailField = $("#exampleInputEmail1").val();
    let passwordField = $("#exampleInputPassword1").val();

    let validationErrors = validateAccountFormInput(emailField, passwordField);

    if(!isArrayEmpty(validationErrors)) {
        displayValidationErrors(validationErrors);
    } else {
        accountExists(emailField,
            (snapshot) => {
                if (snapshot.val()._password === AccountForm.hashPassword(passwordField)) {
                    window.location.assign("./home.html");
                } else {
                    displayValidationErrors(["Invalid email or password"]);
                }
            }, () => displayValidationErrors(["Invalid email or password"]))
    }

    return false;
}

function isArrayEmpty(array) {
    return array === undefined || array.length === 0;
}

let config = {
    apiKey: "AIzaSyDvYPXnuHZ_2ymiOxh9MGwQIbTL3ts3yOE",
    authDomain: "grandmas-little-secrets.firebaseapp.com",
    databaseURL: "https://grandmas-little-secrets.firebaseio.com",
    projectId: "grandmas-little-secrets",
    storageBucket: "",
    messagingSenderId: "409244683082"
};

firebase.initializeApp(config);

let DB = firebase.database().ref();

function accountExists(email, accountExistsCallback, accountDoesntExistCallback) {
    DB.child("accounts/" + escapeEmailAddress(email)).once('value', function(snapshot) {
        if(!snapshot.exists()) {
            accountDoesntExistCallback();
        } else {
            accountExistsCallback(snapshot);
        }
    });
}

function escapeEmailAddress(email) {
    if (!email) return false

    // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
    email = email.toLowerCase();
    email = email.replace(/\./g, ',');
    return email;
}

function displayValidationErrors(validationErrors) {
    let htmlError = "<ul>" + validationErrors.map(x => "<li>" + x + "</li>").reduce((a,b) => a + b, "") + "</ul>";
    $("#information").empty();
    $("#validation-errors").empty();
    $("#validation-errors").append(htmlError);
}

$("#account-form").on("submit", function (e) {
    login();
    e.preventDefault();
    return false;
});

$("#submit").on("click", function (e) {
    $("#account-form").submit();
    e.preventDefault();
    return false;
});