var categories = {"General":9,"Music":12,"Science":17,"Sports":21,"Geography":22,"History":23,"Videogames":15,"Film":11};
var difficulties = ['easy','medium','hard'];
var difficulty;
var category;
var questions = {
    easy:{
    }, medium: {
    }, hard: {
    }
};
var numberOfQuestions = 5;
var currentQuestionIndex=1;
var score = 0;
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
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
function shuffleObject(sourceArray) {
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
    $('#category').addClass('hidden');
    questions[difficulty][category] = shuffleObject(questions[difficulty][category]);
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
    $('#endScreen').removeClass('hidden');
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
    for(var i=scores.length>10?9:scores.length-1;i>=0;i--){
        var scoreObject = scores[i];
        var catname = getCategoryNameById(scoreObject.category);
        $("#scores").append("<div class='score'><p>Score: "+scoreObject.score+"/"+numberOfQuestions+"</p><p>Difficulty: "+scoreObject.difficulty+"</p><p>Category: "+ catname +"</p><p>Date: "+scoreObject.date+"</p></div>")
    }
    $('#startScreen').addClass('hidden');
    $('#endScreen').addClass('hidden');
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
    //alert("database created");
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

//JSON SCHEMA
var jsonSchema = {
    name: {
        title: "Name validation",
        type: "string",
        minLength: 1,
        pattern: "^[A-Za-z\\s]*$"
    },
    email:{
        title: "Email validation",
        type: "string",
        pattern: "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$",
        format: "email"
    },
    question:{
        title: "Question validation",
        minLength: 1
    }
};

var formErrors = 0;
var errorMessages=[];

function submitForm(e){
    $('#errorMsg').html("");
    e.preventDefault();
    validateField(jsonSchema.name, $('#name'));
    validateField(jsonSchema.email, $('#email'));
    validateField(jsonSchema.question, $('#formQuestion'));
    if(formErrors > 0){
        //TO-DO : show errors
        var errorMessage = "<ul>";
        errorMessages.forEach(function(item, index){
            errorMessage += "<li>" + item + "</li>";
        });
        errorMessage += "</ul>";
        $('#errorMsg').append(errorMessage);
    } else{
        $('#errorMsg').empty();
        $('#contactScreen').addClass('hidden');
        $('#startScreen').removeClass('hidden');
    }
    errorMessages = [];
    formErrors = 0;
}

function validateField(schema, field){
    var ajv = new Ajv();
    var valid = ajv.validate(schema, $(field).val());
    if(!valid){
        console.log(ajv.errors);
        var labelText = $(field).prev().text();// .parent().find("label").text();
        errorMessages.push(labelText + " is not valid.");
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
    $('#contactForm').on('submit',submitForm);
});