var categories = {"General":9,"Music":12,"Science":17,"Sports":21,"Geography":22,"History":23,"Videogames":15,"Film":11};
var difficulties = ['easy','medium','hard'];
var difficulty = easy;
var category;
var questions = {
    easy:{

    }, medium: {

    }, hard: {

    }
};
var numberOfQuestions =5;
var currentQuestionIndex=1;
var score = 0;
var KEY_QUESTIONS = "questions";
var scores = [];
if('serviceWorker' in navigator){
    navigator.serviceWorker
        .register('././service-worker.js', {scope: '././'})
        .then(function (registration) {
            console.log("Service worker registered");
        })
        .catch(function (error) {
            console.log('ServiceWorker registration failed', error)
        })

}
var get = function (difficulty,category) {
    var url = "https://opentdb.com/api.php?amount=20&category="+category+"&difficulty="+difficulty+"&type=multiple";
    return new Promise(function (resolve,reject) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE){
                if (xhr.status === 200){
                    var result = xhr.responseText;
                    result = JSON.parse(result);
                    resolve(result);
                } else {
                    reject(xhr);
                }
            }
        };
        xhr.open("GET",url,true);
        xhr.send();
    });

};

var getQuestions = function (difficulty, category) {
    get(difficulty,category)
        .then(function(response){
            questions[difficulty][category] = response.results;
        })
        .catch(function (err) {
            console.log("Error ", err);
        });
};

var loadQuestion = function (givenQuestion) {
    $("#question span").text( decode( givenQuestion['question'] ));
    // delete givenQuestion[0];
    correctAnswer = givenQuestion['correct_answer'];
    var allAnswers = [];
    allAnswers.push(correctAnswer);
    givenQuestion['incorrect_answers'].forEach(function (value) {
        allAnswers.push(value)
    });
    shuffleArray(allAnswers);
    $("#answers").empty();
    allAnswers.forEach(function (value) {
        $("#answers").append('<button type="button" class="btn btn-default answer"  style="color:white;background-color:rgb(98,167,82)"><span>'+decode(value)+'</span></button>')
    });
};
function shuffleArray(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffleArray...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
function shuffleObject(sourceArray) {
    console.log(Object.values(sourceArray));
    sourceArray = Object.values(sourceArray);
    var shuffledArray = [];
    var rand = getRandomInt(0, sourceArray.length - 1);
    var count = 0;
    while (Object.keys(sourceArray).length > 0) {
        if (sourceArray[rand] !== undefined) {
            shuffledArray.push(sourceArray[rand]);
            sourceArray.splice(rand, 1);
        }
        rand = getRandomInt(0, sourceArray.length);
    }
    return shuffledArray;
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function decode(encodedStr){
    var parser = new DOMParser;
    var dom = parser.parseFromString(
        '<!doctype html><body>' + encodedStr,
        'text/html');
    var decodedString = dom.body.textContent;
    return decodedString;
}
var showDifficulty = function (e) {
    e.preventDefault();
    $('#startScreen').addClass('hidden');
    $('#difficulty').removeClass('hidden');
};
var showCategories = function (e) {
    e.preventDefault();
    $('#difficulty').addClass('hidden');
    $('#category').removeClass('hidden');
    difficulty = $(this).prop('id');

    for(var cat in categories){
        if(difficulty === 'hard' && (categories[cat] === 21 || categories[cat] === 10)) {
            console.log('No hard questions for this category');
        }
        else {
            $("#categoryNames").append("<button class='btn btn-default category' id='"+categories[cat]+"' style='color:white;background-color:rgb(98,167,82)'>"+cat+"</button>");
        }
    }
};
var startGame = function (e) {
    e.preventDefault();
    category = $(this).prop('id');
    console.log(category);
    $('#category').addClass('hidden');
    console.log(questions[difficulty][category]);
    questions[difficulty][category] = shuffleObject(questions[difficulty][category]);
    console.log(questions[difficulty][category]);
    $('#quiz').removeClass('hidden');
    loadQuestion(questions[difficulty][category][currentQuestionIndex]);
};
var verifyQuestion = function (e) {
    e.preventDefault();
    var givenAnswer = $(this).text();
    verifyAnswer(givenAnswer);
};
var verifyAnswer = function (answer) {
    $('#quiz').addClass('hidden');
    var correctAnswer = questions[difficulty][category][currentQuestionIndex].correct_answer;
    console.log(correctAnswer);
    if(decode(answer) === decode(correctAnswer)){
        $('.succes').removeClass('hidden');
        score++;
    } else {
        $('.failure').removeClass('hidden');
        $('#correct').text(decode(correctAnswer));
    }
};
var nextQuestion = function (e) {
    e.preventDefault();
    $('.failure').addClass('hidden');
    $('.succes').addClass('hidden');
    if(currentQuestionIndex === numberOfQuestions ){
        handleScore();
    } else {
        $('#quiz').removeClass('hidden');
        currentQuestionIndex++;
        loadQuestion(questions[difficulty][category][currentQuestionIndex]);
    }

};
var handleScore = function () {
    $('#endscreen').removeClass('hidden');
    // TO DO: show end message
    $('#score').text(score+"/"+numberOfQuestions);
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var thisScore ={score:score,date:dd+"/"+mm+"/"+yyyy,difficulty:difficulty,category:category};
    scores.push(thisScore);
    saveScore(thisScore);
};
var reload = function (e) {
    window.location.reload(true);
};

var showHistory = function () {
    console.log(scores);
    for(var i=scores.length-1;i>=0;i--){
        var scoreObject = scores[i];
        var catname = getCategoryNameById(scoreObject.category);
        $("#scores").append("<div class='score'><p>Score: "+scoreObject.score+"</p><p>Difficulty: "+scoreObject.difficulty+"</p><p>Category: "+ catname +"</p><p>Date: "+scoreObject.date+"</p></div>")
    }
    $('#startScreen').addClass('hidden');
    $('#endscreen').addClass('hidden');
    $("#scoreScreen").removeClass('hidden');
};
var getCategoryNameById = function (id) {
    for (var catName in categories){
        if(categories[catName]==id){
            return catName;
        }
    }
};
var showContact = function () {
    $('#startScreen').addClass('hidden');
    $('#contactScreen').removeClass('hidden');
};
var submitForm = function (e) {
    var ajv = new Ajv();
    var valid = ajv.validate(schema)
};

//indexedDB
window.indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB;
if(!window.indexedDB){
    console.log("oops, not supported");
}
var request = window.indexedDB.open("historyDB",1);
var db = null;
request.onerror = function (ev) {
    alert("Something went wrong!")
};
request.onupgradeneeded = function (ev) {
    db =ev.target.result;
    var os = db.createObjectStore("scores", {keyPath:"id", autoIncrement: true});
    alert("database created");
};
request.onsuccess = function (ev) {
    db = ev.target.result;
    scores = typeof retrieveScores() === 'undefined' ? [] : retrieveScores();
};
var saveScore = function (score) {
    var trans = db.transaction("scores","readwrite");
    var os = trans.objectStore("scores");
    os.add(score);
};
var retrieveScores = function(){
    var trans = db.transaction("scores");
    var os = trans.objectStore("scores");
    var cursor = os.openCursor();
    scores=[];
    cursor.onsuccess = function (ev) {
        var c =ev.target.result;
        if(c){
            var value = c.value;
            scores.push(value);
            c.continue();
        } else {
        // Finished
        }
    }
};

//FORM & JSON SCHEMA
var jsonSchema = {
    name: {
        "title": "Name validation",
        "type": "string",
        "minLength":1,
        "pattern": "^[A-Za-z\\s]*$"
    },
    email:{
        "title": "Email validation",
        "type": "string",
        "pattern": "[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}",
        "format": "email"
    }
};



function handleForm(e){
    e.preventDefault();
    var needValidation = [$('#fullName'), $('#email')];
    for(var i = 0; i<needValidation.length;i++){
        if(i == 0) validateField(nameJsonSchema, needValidation[i]);
        else if(i == 1)validateField(emailJsonSchema, needValidation[i]);
        else if(i == 2)validateField(phoneJsonSchema, needValidation[i]);
    }

    if(formErrors != 0){
        //TO-DO : show errors
        var errorMessages = "<ul class='bulletPoints'>";
        formErrorMessages.forEach(function(item, index){
            errorMessages += "<li>" + item + "</li>";
        });
        errorMessages += "</ul>";
        $('#errorMessages').append(errorMessages);
    } else{
        $('#errorMessages').empty();
        $('#inputClient').toggleClass('hide');
        $('#options').toggleClass('hide');
    }
    formErrorMessages = [];
    formErrors = 0;
}

function validateField(schema, field){
    var ajv = new Ajv();
    var valid = ajv.validate(schema, $(field).val());
    if(!valid){
        console.log(ajv.errors);
        var labelText = $(field).parent().find("label").text();
        formErrorMessages.push(labelText + " is not valid.");
        formErrors++;
    }
}

$(document).ready(function () {
    difficulties.forEach(function (diff) {
        for (var cat in categories) {
            getQuestions(diff,categories[cat]);
        }
    });
    $('#start').on('click',showDifficulty);
    $('.difficulty').on('click',showCategories);
    $('#category').on('click','button',startGame);
    $('#answers').on('click','button',verifyQuestion);
    $('.continue').on('click',nextQuestion);
    $('.home').on('click',reload);
    $('.history').on('click',showHistory);
    $('#contact').on('click',showContact);
    $('#contactForm').on('click',submitForm);
});