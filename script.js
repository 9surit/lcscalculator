
const START_STATS = {
  "HRT": 8, "INT": 3, "WIS": 1, "HTH": 6, "AGI": 5, "STR": 4, "CHA": 4
};

const SKILL_ATTR = {
  "Art": "HRT", "Axe": "STR", "Business": "INT",
  "Club": "STR", "Computers": "INT", "Disguise": "CHA", "Dodge": "AGI",
  "Driving": "AGI", "First Aid": "INT", "Heavy Weapons": "STR",
  "Knife": "AGI", "Law": "INT", "Martial Arts": "AGI", "Music": "HRT",
  "Persuasion": "CHA", "Pistol": "AGI", "Psychology": "INT",
  "Religion": "INT", "Rifle": "AGI", "Science": "INT", "Security": "INT",
  "Seduction": "CHA", "Shotgun": "AGI", "SMG": "AGI", "Stealth": "AGI",
  "Street Sense": "INT", "Sword": "AGI", "Tailoring": "INT", "Teaching": "INT",
  "Throwing": "AGI", "Writing": "INT"
}

const STAT_AT_MAX = {
  1: 8, 2: 9, 3: 10, 4: 12, 5: 13, 6: 15, 7: 16, 8: 18, 9: 19, 10: 20,
  11: 20, 12: 20, 13: 20, 14: 20, 15: 20, 16: 20, 17: 20, 18: 20, 19: 20
}

const ALL_ATTRIBUTES = ["HRT", "INT", "HTH", "AGI", "STR", "CHA"];

const questionData = { questions: null };


// On startup load all the questions
$.get('questions.json', function (data) {
  questionData.questions = data;
  console.log(data);
  let questionCount = 0;
  data.forEach(question => {
    let questionId = "question" + questionCount;
    let questionDOM = $("<div>")
    questionDOM.html(`<h4>${question.question}</h4>`)

    let answerCount = 0;
    question.answers.forEach(answer => {
      let formDOM = $("<div class=\"form-check\">")
      let id = questionId + "answer" + answerCount
      let radioDOM = $("<input class=\"form-check-input\" type=\"radio\" name=\"" + questionId + "\" id=\"" + id + "\" value=\"" + questionCount + ":" + answerCount + "\">")
      let labelDOM = $("<label class=\"form-check-label\" for=\"" + id + "\">")
        .text(answer.text);
      formDOM.append(radioDOM).append(labelDOM)

      questionDOM.append(formDOM)
      answerCount++
    })
    $("#questions").append(questionDOM)
    questionCount++
  });
}, 'json');

function calculate() {
  try {
    doCalculate();
  } catch (e) {
    console.log(e)
  }
}

function doCalculate() {
  var selectedRadioDOMs = $("input[type=radio]:checked")
  if (selectedRadioDOMs.length <= 0) {
    // do nothing
    return;
  }
  if (selectedRadioDOMs.length < questionData.questions.length) {
    alert("WARNING: Not all questions were answered, result may not be accurate")
  }

  let stats = $.extend({}, START_STATS)
  let skills = {}
  let bonus = []
  let money = 0
  selectedRadioDOMs.each((index, radioButton) => {
    let questionAnswer = radioButton.value.split(":")
    let question = questionData.questions[questionAnswer[0]]
    let answer = question.answers[questionAnswer[1]]
    let changes = answer.changes
    for (const stat in changes.stat) {
      // console.log(`stats: ${JSON.stringify(stats)} / stat: ${stat}`)
      // console.log(`changes[stat]: ${changes.stat[stat]}`)
      stats[stat] = (stats[stat] ?? 0) + changes.stat[stat]
    }
    for (const skill in changes.skill) {
      // console.log(`skills: ${JSON.stringify(skills)} / skill: ${skill}`)
      skills[skill] = (skills[skill] ?? 0) + changes.skill[skill]
    }
    bonus.push(...changes.bonus)
    money += changes.money
  })
  // console.log(JSON.stringify(stats))
  // console.log(JSON.stringify(skills))
  // console.log(JSON.stringify(bonus))
  // console.log(JSON.stringify(money))

  
  let skillsList = []
  for (const skill in skills) {
    let attr = SKILL_ATTR[skill]
    let name = `${skill} (${attr})`
    skillsList.push({ "name": name, "value": skills[skill] })
  }
  skillsList.sort((a, b) => { // sort descending by strongest skill
    return b.value - a.value
  });
  console.log("skilllist" + skillsList)
  setDOM(stats, skillsList, bonus, money)
}

function clearInput() {
  try {
    console.log("HELLO WOLRD")
    let stats = {}
    let skillsList = []
    let bonus = []
    let money = 0
  
    var selectedRadioDOMs = $("input[type=radio]:checked")
    if (selectedRadioDOMs.length <= 0) {
      // do nothing
      return;
    }
    selectedRadioDOMs.each((index, radioButton) => {
      $(radioButton).prop('checked', false);
      $(radioButton).removeClass("active");
    })
  
    setDOM(stats, skillsList, bonus, money)
  } catch (e) {
    console.log(e)
  }
}

function setDOM(stats, skillsList, bonus, money) {
    ALL_ATTRIBUTES.forEach(attribute => {
      let statValue = stats[attribute];
      if (statValue) {
        let maxValue = STAT_AT_MAX[statValue];
        let changed = "+" + (maxValue - statValue ?? 0)
        $(`#stat-${attribute}-0`).text(statValue)
        $(`#stat-${attribute}-change`).text(changed)
        $(`#stat-${attribute}-max`).text(maxValue)
      } else {
        $(`#stat-${attribute}-0`).text("?")
        $(`#stat-${attribute}-change`).text("?")
        $(`#stat-${attribute}-max`).text("?")
      }
    })
  
    let skillsDOM = $("#skills")
    skillsDOM.html("")
    skillsList.forEach(skillItem => {
      let row = $("<tr>")
      row.append($("<td>").text(skillItem.name))
      row.append($("<td>").text(skillItem.value))
      skillsDOM.append(row)
    })
  
    $("#money").text(money)
    $("#bonus").text(bonus.join(", "))
}
