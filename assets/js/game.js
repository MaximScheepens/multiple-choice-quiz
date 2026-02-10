const choices = Array.from(document.getElementsByClassName("choice-text"));
const question = document.getElementById("question");
const scoreText = document.getElementById("score");
const progressText = document.getElementById("progressText");
const progressBarFull = document.getElementById("progressBarFull");

let score = 0;
let currentQuestion = {};
let questionCounter = 0;
let acceptingAnswers = false;
let availableQuesions = [];
let questionAnswers = 0;
let questionHistory = [];
let questionHistoryIndex = 0;

let questions = [
  {
    question : "Inside which HTML element do we put the JavaScript??",
    choice1  : "<script>",
    choice2  : "<javascript>",
    choice3  : "<js>",
    choice4  : "<scripting>",
    answers  : [1]
  },         
  {          
    question : "What is the correct syntax for referring to an external script called 'xxx.js'?",
    choice1  : "<script href='xxx.js'>",
    choice2  : "<script name='xxx.js'>",
    choice3  : "<script src='xxx.js'>",
    choice4  : "<script file='xxx.js'>",
    answers   : [3]
  },         
  {          
    question : "How do you write 'Hello World' in an alert box?",
    choice1  : "msgBox('Hello World');",
    choice2  : "alertBox('Hello World');",
    choice3  : "msg('Hello World');",
    choice4  : "alert('Hello World');",
    answers   : [4]
  }
];

let questions3 = questions;

let currentQuestionaire = questions3

//CONSTANTS
const INCORRECT_TAX = 1;
let MAX_QUESTIONS = currentQuestionaire.length;

// Start Game & Timer
startGame = () => {

  score = 100;
  questionCounter = 0;
  questionAnswers = 0;
  availableQuesions = [...currentQuestionaire];

  getNewQuestion();

  /*
  // Timer
  setInterval(function () {

    score--;
     scoreText.innerText = score;

    if (score === 0) {
      localStorage.setItem("mostRecentScore", score);
      return window.location.assign("../../assets/html/end.html");
    }

  }, 1000);
  */
};

// Display Next Random Question and Answers
getNewQuestion = () => {
  
  if (currentQuestionaire.length && (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS)) {
    localStorage.setItem("mostRecentScore", score);
    return window.location.assign("../html/end.html");
  }

  if (currentQuestion)
  {
    questionHistory.push(currentQuestion); 
    questionHistoryIndex += 1;
  }
  
  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuesions.length);
  currentQuestion = availableQuesions[questionIndex];

  // Load the question
  loadCurrentQuestion();

  availableQuesions.splice(questionIndex, 1);
  acceptingAnswers = true;
 
  questionAnswers = 0;
};

function loadCurrentQuestion() {

  question.innerText = currentQuestion.question;
  // Get Answers
  choices.forEach(choice => {
  
    const number = choice.dataset["number"];
    choice.innerText = currentQuestion["choice" + number];

    // console.log("remove classes: incorrect and correct for choice # ", number);

    choice.parentElement.classList.remove("correct");
    choice.parentElement.classList.remove("incorrect");

    if (number === "5")  {
      if (choice.innerText === "undefined") {
        hideParent(choice);
      }
      else {
        unhideParent(choice);
      }
    }
    if (number === "6")  {
      if (choice.innerText === "undefined") {
        hideParent(choice);
      }
      else {
        unhideParent(choice);
      }
    }

  });
}

//Get User's Choice
choices.forEach(choice => {
  choice.addEventListener("click", e => {

    // if (!acceptingAnswers) return;
    // acceptingAnswers = false;

    const selectedChoice = e.target;
    const selectedAnswer = parseInt(selectedChoice.dataset["number"], 10);
    
    const classToApply = currentQuestion.answers.includes(selectedAnswer) ? "correct" : "incorrect";
    if (classToApply === "incorrect") {
      decrementScore(INCORRECT_TAX);
    }
    else {
      ++questionAnswers;
    }
    selectedChoice.parentElement.classList.add(classToApply);

    if (questionAnswers === currentQuestion.answers.length)
    {
      setTimeout(() => {
        selectedChoice.parentElement.classList.remove(classToApply);
        getNewQuestion();
      }, classToApply === "incorrect" ? 60 * 1000 : 2 * 1000);
    }
  });
});


function hideParent(el) {
  const container = el.closest('.choice-container');
  if (container) container.classList.add('is-hidden');
}

function unhideParent(el) {
  const container = el.closest('.choice-container');
  if (container) container.classList.remove('is-hidden');
}

//Penalty for wrong choice
decrementScore = num => {
  score -= num;
  scoreText.innerText = score;
};

function prevButtonOnClick() {
  console.log("prevButtonOnClick(): load the previous question.")
  console.log(questionHistoryIndex);
  console.log(questionHistory);

  questionHistoryIndex -= 1;
  currentQuestion = questionHistory.pop();
  // Load the question
  loadCurrentQuestion();

  console.log(question);
}

function nextButtonOnClick() {
  console.log("nextButtonOnClick(): load the next question.")
  console.log(questionHistoryIndex);
  console.log(questionHistory);
}

  // --- Loader: read local JSON file, fill questions3, update MAX_QUESTIONS, then startGame() ---

  // Optional: a small schema normalizer to ensure answers are arrays of numbers
function normalizeQuestions(input) {
  const arr = Array.isArray(input) ? input
          : Array.isArray(input?.questions) ? input.questions
          : Array.isArray(input?.items) ? input.items
          : [];

  return arr.map(q => {
    const rawAnswers = Array.isArray(q.answers) ? q.answers : [q.answers];
    const answers = rawAnswers
      .map(a => (typeof a === 'string' ? parseInt(a, 10) : a))
      .filter(n => Number.isFinite(n));

    return { ...q, answers };
  });
}

async function loadQuestionsFromFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const normalized = normalizeQuestions(parsed);

  if (!Array.isArray(normalized) || normalized.length === 0) {
    throw new Error('No questions found. Expected an array or an object with a "questions" array.');
  }

  // Assign to your game’s question bank and update max
  currentQuestionaire = normalized;
  MAX_QUESTIONS = currentQuestionaire.length;

  // Start the game now that the data is ready
  startGame();
}

// Wire up the <input type="file">
document.getElementById('questionsFile').addEventListener('change', (e) => {
  
  const file = e.target.files?.[0];
  if (!file) return;

  loadQuestionsFromFile(file).catch(err => {
    console.error(err);
    alert('Failed to load JSON: ' + err.message);
  });
});

// If you still want a default run with the hardcoded arrays, uncomment this:
startGame();
