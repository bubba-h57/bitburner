var keep_going = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAvailable(option) {
  return option.style.display === 'block';
}

function infiltrate_faction(faction, target, first) {
  //   document.getElementById(target).click();
  //   document.getElementById('location-infiltrate').click();
  //   var infiltrate_hack = document.getElementById('infiltration-hacksecurity');
  //   var infiltrate_stealthko = document.getElementById('infiltration-stealthknockout');
  //   var infiltrate_escape = document.getElementById('infiltration-escape');
  //   var progress = document.getElementById('infiltration-level-text');
  //   var infiltration_box = document.getElementById('infiltration-box-container');
  //   for (i = 0; (first || !isAvailable(infiltration_box)) && i < 100; i++) {
  //     if (i > 50) infiltrate_escape.click();
  //     else if (isAvailable(infiltrate_hack)) infiltrate_hack.click();
  //     else if (isAvailable(infiltrate_stealthko)) infiltrate_stealthko.click();
  //   }
  //   document.getElementById('infiltration-faction-select').value = faction;
  //   document.getElementById('infiltration-box-faction').click();
  //   document.getElementById('location-hospital-treatment').click();
}

async function keep_infiltrating_faction(faction, target) {
  keep_going = true;
  //target = "ishima-omegasoftware";
  infiltrate_faction(faction, 'sector12-joesguns', true);
  while (keep_going) {
    infiltrate_faction(faction, target, false);
    await sleep(500);
  }
}
