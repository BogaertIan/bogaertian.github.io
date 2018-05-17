var categories = {"General":9,"Music":12,"Science":17,"Sports":21,"Geography":22,"History":23,"Celebrities":26,"Film":11};
var difficulties = ['easy','medium','hard'];
var difficulty = easy;
var category;
var questions = {
    easy:{

    }, medium: {

    }, hard: {

    }
};
var currentQuestionIndex=0;
var score = 0;
var KEY_QUESTIONS = "questions";
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
    var url = "https://opentdb.com/api.php?amount=30&category="+category+"&difficulty="+difficulty+"&type=multiple";
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
        $("#answers").append('<button type="button" class="btn btn-default answer"><span>'+decode(value)+'</span></button>')
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
        if(difficulty === 'hard' && (categories[cat] === 21||categories[cat]===26)) {
            console.log('No hard questions for this category');
        }else {
            $("#categoryNames").append("<button class='btn btn-default category' id='"+categories[cat]+"'>"+cat+"</button>");

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
    if(answer === correctAnswer){
        $('.succes').removeClass('hidden');
        score++;
    } else {
        $('.failure').removeClass('hidden');
        $('#correct').text(correctAnswer);
    }
};
var nextQuestion = function (e) {
    e.preventDefault();
    $('.failure').addClass('hidden');
    $('.succes').addClass('hidden');
    if(currentQuestionIndex === questions[difficulty][category].length-1 ){
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
    $('#score').text(score+"/"+questions[difficulty][category].length);

};
var reload = function (e) {
    location.reload();
};



$(document).ready(function () {
    difficulties.forEach(function (diff) {
        for (var cat in categories) {
            getQuestions(diff,categories[cat]);
        }
    });
    console.log(questions);
    $('#start').on('click',showDifficulty);
    $('.difficulty').on('click',showCategories);
    $('#category').on('click','button',startGame);
    $('#answers').on('click','button',verifyQuestion);
    $('.continue').on('click',nextQuestion);
    $('.home').on('click',reload);
});

