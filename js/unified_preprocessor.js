var eObj = {};

let processBtn = document.getElementById('process');
let resetBtn = document.getElementById('resetFields');
let clearBtn = document.getElementById('clearAll');
let L3Btn = document.getElementById("L3_action");
let ovlBtn = document.getElementById("overlay_action");

function ovlBtnHandler(e) {
  let ovlType = e.target.id.split("_")[0];
  eObj = makeObj(ovlType);
  let input_inst;
  let edit_inst;
  let style_opts;
  let jobs;
  let ctrls = document.querySelector('#globalControls .row');
  if (ovlType == "L3") {
    input_inst = document.getElementById("L3_input_instructions").content.cloneNode('true');
    edit_inst = document.getElementById("L3_edit_instructions").content.cloneNode('true');
    style_opts = document.getElementById("style_L3_options").content.cloneNode('true');
    if (ctrls.length > 2) {
      let job_num = ctrls.querySelector('.jobNumDiv');
      let job_name = ctrls.querySelector('.jobNameDiv');
      job_num.remove();
      job_name.remove();
    }
  } else {
    input_inst = document.getElementById("overlay_input_instructions").content.cloneNode('true');
    edit_inst = document.getElementById("overlay_edit_instructions").content.cloneNode('true');
    style_opts = document.getElementById("style_overlay_options").content.cloneNode('true');
    jobs = document.getElementById("job_overlay_input").content.cloneNode('true');
    ctrls.appendChild(jobs);    
  }
  let input_ul = document.getElementById("input_instructions");
  let edit_ul = document.getElementById("edit_instructions");
  let styleSel = document.getElementById("style");
  while (input_ul.firstChild) {
    input_ul.removeChild(input_ul.lastChild);
  }
  while (edit_ul.firstChild) {
    edit_ul.removeChild(edit_ul.lastChild);
  }
  while (styleSel.firstChild) {
    styleSel.removeChild(styleSel.lastChild);
  }
  input_ul.appendChild(input_inst);
  edit_ul.appendChild(edit_inst);
  styleSel.appendChild(style_opts);
}

function getText() {
  let elem = document.getElementById("textVal");
  let gotText = elem.value;
  let gotArray = gotText.split("\n");
  let outArray = new Array();
  let split = (eObj.type == "L3") ? "\t" : "|";
  for (let i = 0; i < gotArray.length; i++) {
    let r = gotArray[i]; // replace first \t with space, then split on \t
    if (eObj.type == "L3") {
      const rplArr = [/ \t/g, /\t /g, /\t\t/g, /  /g];
      let rplLen = rplArr.length;
      let t;
      let p;
      for (t=0; t<rplLen; t++) {
        p = (t < 3) ? "\t" : "  ";
        r = r.replace(rplArr[t], p);
      }
      r = r.replace(/\t/, ' ');
    }
    if (r != "") { outArray.push(r.split(split)); }
  }
  return outArray;
}

function toTitleCase(style) { // Used only by graphic overlays
  let str = style.toLowerCase();
  let spl = str.split(" ");
  let nStr = "";
  for (i = 0; i < spl.length; i++) {
    nStr += spl[i][0].toUpperCase() + spl[i].substring(1);
    if (i < spl.length - 1) { nStr += " "; }
  }
  return nStr;
}

function formatStyleId(style) { // Used only by graphic overlays
  style = style.toUpperCase();
  let styleId = "";
  switch (style) {
    case "SHORT MESSAGE":
      return "Short";
      break;
    case "MEDIUM MESSAGE":
      return "Medium";
      break;
    case "LONG MESSAGE":
      return "Long";
      break;
    case "STAT":
      return "Stat";
      break;
    case "STAT WITH TEXT":
      return "Stat-Text";
      break;
    case "IMAGE":
      return "Image";
      break;
  }
}

function makeObj(ovlType) {
  let myObj = {};
  myObj.origin = "Unified Overlay Preprocessor"
  myObj.type = ovlType;
  myObj.designer = "";
  myObj.projNum = "";
  myObj.jobNum = "";
  myObj.jobName = "";
  myObj.jobNameFmt = "";
  myObj.style = (ovlType == "L3") ? "Standard" : "";
  myObj.styleId = (ovlType == "L3") ? "Standard" : "";
  myObj.color = "Blue";
  myObj.colorId = "1";
  myObj.side = "Right";
  myObj.version = "1";
  myObj.entries = new Array();
  return myObj;
}

function processText(textArray) {
  for (let c = 0; c < textArray.length; c++) {
    let entry = {};
    let r = textArray[c];
    if (eObj.type == "L3") {
      entry.style = eObj.style;
      entry.styleId = eObj.styleId;
      entry.side = eObj.side;
      entry.personName = r[0];
      entry.jobTitle = r[1];
      entry.quote = (typeof r[2] == "undefined") ? null : r[2];
    } else {
      entry.num = r[0];
      let styleFmt = toTitleCase(r[1]);
      entry.style = styleFmt;
      entry.styleId = formatStyleId(styleFmt);
      let iSide = r[2];
      if (iSide.toLowerCase() == "right") { iSide = "Right"; }
      if (iSide.toLowerCase() == "left") { iSide = "Left"; }
      entry.side = iSide;
      entry.txt = r[3];
    }
    entry.color = eObj.color;
    entry.colorId = eObj.colorId;
    entry.version = eObj.version.toString();
    eObj.entries.push(entry);
  }
}

function makeTable() {
  let checkID = "";
  let tableString = `    <table class=\"dataTable\" id=\"entriesTable\">\n
           <thead>\n
            <tr>\n
              <th id=\"selOpts\">\n
                <p>Select:</p>\n
                <button id=\"allP\" type=\"button\">All</a></button>\n
                <button id=\"noneP\" type=\"button\">None</button>\n
                <button id=\"invertP\" type=\"button\">Invert</button>\n
              </th>\n`;
  if (eObj.type == "L3") {
    tableString += `    <th>Style</th>\n
              <th>Color</th>\n
              <th>Side</th>\n
              <th>Ver.</th>\n
              <th>Name</th>\n
              <th>Title</th>\n
              <th>Quote</th>\n
            </tr>\n
          </thead>\n
          <tbody>\n`;
  } else {
    tableString += `      <th>#</th>\n
              <th>Style</th>\n
              <th>Color</th>\n
              <th>Side</th>\n
              <th>Ver.</th>\n
              <th>Text</th>\n
              </tr>\n
              </thead>\n
              <tbody>\n`;
  }
  let endString = `      </tbody>\n
        </table>`;
  let rows = "";
  let en = eObj.entries;
  for (let c = 0; c < en.length; c++) {
    let r = en[c];
    let myQuote = (r.quote == null) ? "n/a" : r.quote;
    checkID = c.toString();
    if (eObj.type == "L3") {
      rowString = `         <tr class=\"entryRow\" id=\"entry_${checkID}\">\n
      <td class=\"globals\" id=\"checkcell_${checkID}\"><input type=\"checkbox\" id=\"check_${checkID}\" class=\"multicheck\"/></td>\n
      <td class=\"globals\" id=\"style_${checkID}\">${r.style}</td>\n
      <td class=\"globals\" id=\"color_${checkID}\">${r.color}</td>\n
      <td class=\"globals\" id=\"side_${checkID}\">${r.side}</td>\n
      <td class=\"editText globals\" contenteditable=\"true\" id=\"version_${c}\">${r.version}</td>\n
      <td class=\"editText\" contenteditable=\"true\" id=\"personName_${c}\">${r.personName}</td>\n
      <td class=\"editText\" contenteditable=\"true\" id=\"jobTitle_${c}\">${r.jobTitle}</td>\n
      <td class=\"editText\" contenteditable=\"true\" id=\"quote_${c}\">${myQuote}</td>\n
    </tr>`;
    } else {
      rowString = `         <tr class=\"entryRow\" id=\"entry_${checkID}\">\n
      <td class=\"globals\" id=\"checkcell_${checkID}\"><input type=\"checkbox\" id=\"check_${checkID}\" class=\"multicheck\"/></td>\n
      <td class=\"editText\" contenteditable=\"true\" id=\"num_${checkID}\">${r.num}</td>\n
      <td class=\"globals\" id=\"style_${checkID}\">${r.style}</td>\n
      <td class=\"globals\" id=\"color_${checkID}\">${r.color}</td>\n
      <td class=\"globals\" id=\"side_${checkID}\">${r.side}</td>\n
      <td class=\"globals\" id=\"version_${c}\">${r.version}</td>\n
      <td class=\"editText\" contenteditable=\"true\" id=\"txt_${c}\">${r.txt}</td>\n
    </tr>`;
    }
    rows += rowString;
  }
  tableString += rows + endString;
  return tableString;
}

function updateObject(elem) {
  let el = elem.id;
  let newTx = elem.innerText;
  newTx = newTx.replace(/[\r\n]+/gm, "");
  let frags = el.split("_");
  let obName = frags[0];
  let obIdx = parseInt(frags[1]);
  if (eObj.type == "L3") {
    switch (obName) {
      case "personName":
        eObj.entries[obIdx].personName = newTx;
        break;
      case "jobTitle":
        eObj.entries[obIdx].jobTitle = newTx;
        break;
      case "quote":
        eObj.entries[obIdx].quote = newTx;
        break;
    }
  } else {
    switch (obName) {
      case "txt":
        eObj.entries[obIdx].txt = newTx;
        break;
      case "num":
        eObj.entries[obIdx].num = newTx;
        break;
    }
  }
}

function getSelects() {
  let outArray = new Array();
  let styles = document.getElementById("style");
  let colors = document.getElementById("color");
  let sides = document.getElementById("side");
  outArray.push([styles.options[styles.selectedIndex].value, styles.options[styles.selectedIndex].text]);
  outArray.push([colors.options[colors.selectedIndex].value, colors.options[colors.selectedIndex].text]);
  outArray.push([sides.options[sides.selectedIndex].value, sides.options[sides.selectedIndex].text]);
  outArray.push(document.getElementById("versionNumber").value);
  return outArray;
}

function getSlctdIdx(range) {
  let outArray = new Array();
  let boxes;
  if (range == "all") {
    boxes = document.querySelectorAll("input[type=checkbox]");
  } else {
    boxes = document.querySelectorAll("input[type=checkbox]:checked");
  }
  for (const box of boxes) {
    let idx = box.id.split("_");
    outArray.push(idx[1]);
  }
  return outArray;
}

function updateFields(range) {
  let rows = document.getElementsByClassName("entryRow");
  let len = range.length;
  for (let i = 0; i < len; i++) { // iterate collection for target rows
    let tempArray = rows[range[i]].getElementsByClassName("globals");
    let tempLen = tempArray.length;
    for (let c = 0; c < tempLen; c++) {
      let test = tempArray[c].id.split("_")[0];
      let obIx = tempArray[c].id.split("_")[1];
      switch (test) {
        case "style":
          tempArray[c].innerText = eObj.entries[obIx].style;
          break;
        case "color":
          tempArray[c].innerText = eObj.entries[obIx].color;
          break;
        case "side":
          tempArray[c].innerText = eObj.entries[obIx].side;
          break;
        case "version":
          tempArray[c].innerText = eObj.entries[obIx].version;
          break;
      }
    }
  }
}

function clearEverything() {
  let table = document.getElementById("entriesTable");
  let proj = document.getElementById("projNum");
  let textArea = document.getElementById("textVal");
  let ver = document.getElementById("versionNumber");
  let txtDiv = document.getElementById("editWrapper");
  let options = document.querySelectorAll('select option');
  if (eObj.type != "L3") {
    let job = document.getElementById("jobNum");
    let jName = document.getElementById("jobName");
    job.value = "";
    jName.value = "";
  }
  for (var i = 0, l = options.length; i < l; i++) {
    options[i].selected = options[i].defaultSelected;
  }
  allSelectToggle("none");
  table.remove();
  proj.value = "";
  textArea.value = "";
  ver.value = "1";
  eObj = makeObj();
  txtDiv.removeAttribute("hidden");
  let entries = document.getElementById("entriesWrapper")
  entries.setAttribute("hidden", "");
}

function objAddGlobals() {
  let proj = document.getElementById("projNum");
  let dsgnr = document.getElementById("designer");
  let valMsg = "";
  let nms = dsgnr.value.split(" ");
  let inits = "";
  let job;
  let jbName;
  for (let t = 0; t < nms.length; t++) { inits += nms[t][0]; }
  if (!proj.validity.valid) {
    valMsg += "Project Number is required, and must be a 5-digit number\n";
  }
  if (!dsgnr.validity.valid) {
    valMsg += "Designer is required\n";
  }
if (eObj.type != "L3") {
  job = document.getElementById("jobNum"); // eg "GS03"
  console.log(job);
  jbName = document.getElementById("jobName");
  if (!job.validity.valid) { valMsg += "Job Number is required, and must be a 5-digit number\n"; }
  if (!jbName.validity.valid) { valMsg += "Job Name is required\n"; }
}
  if (valMsg != "") {
    alert(valMsg);
    return false;
  }
  eObj.projNum = proj.value;
  eObj.designer = inits;
  if (eObj.type != "L3") {
    eObj.jobNum = job.value;
    eObj.jobName = jbName.value.replace(/ /g, "");
  }
  return true;
}

function allSelectToggle(action) { //all, none, invert
  let cBoxes = document.querySelectorAll("input[type=\"checkbox\"]");
  cBoxes.forEach((cBox) => {
    switch (action) {
      case "all":
        if (!cBox.checked) {cBox.checked = true;}
        break;
      case "none":
        if (cBox.checked) {cBox.checked = false;}
        break;
      case "invert":
        (cBox.checked) ? cBox.checked = false: cBox.checked = true;
        break;
    }
  });
}

function toggleHidden() {
  let txtDiv = document.getElementById("editWrapper");
  let entries = document.getElementById("entriesWrapper");
  (txtDiv.hidden) ? txtDiv.removeAttribute("hidden"): txtDiv.setAttribute("hidden", "");
  (entries.hidden) ? entries.removeAttribute("hidden"): entries.setAttribute("hidden", "");
}

function formatDate() { // Formats a new date for use in the new comp folder name. Returns a string.
  myDate = new Date();
  var sep = "-";
  var rawYear = myDate.getFullYear() - 2000;
  var fmtYear = rawYear.toString();
  var rawMonth =  myDate.getMonth() + 1;
  var fmtMonth = (rawMonth < 10) ? "0" + rawMonth.toString() : rawMonth.toString();
  var rawDay = myDate.getDate();
  var fmtDay = (rawDay < 10) ? "0" + rawDay.toString() : rawDay.toString();
  var fmtDate = fmtMonth + sep + fmtDay + sep + fmtYear;
  var rawHours = myDate.getHours();
  var fmtHours = (rawHours < 10) ? "0" + rawHours.toString() : rawHours.toString();
  var rawMinutes = myDate.getMinutes();
  var fmtMinutes = (rawMinutes < 10) ? "0" + rawMinutes.toString() : rawMinutes.toString();
  fmtDate += "_" + fmtHours + sep + fmtMinutes;
  return fmtDate;
}

function applyBtnHandler(e) {
  let range = (e.target.id.includes("All")) ? "all" : "slctd";
  let globalsArray = getSelects();
  let selectedElems = getSlctdIdx(range);
  let elLen = selectedElems.length;
  let idx;
  for (let i = 0; i < elLen; i++) {
    idx = selectedElems[i];
    if (globalsArray[0][0] != "none") {
      eObj.entries[idx].style = globalsArray[0][1];
      eObj.entries[idx].styleId = globalsArray[0][0];
    }

    if (globalsArray[1][0] != "none") {
      eObj.entries[idx].color = globalsArray[1][1];
      eObj.entries[idx].colorId = globalsArray[1][0];
    }

    if (globalsArray[2][0] != "none") {
      eObj.entries[idx].side = globalsArray[2][0];
    }

    if (globalsArray[3] != "0") {
      eObj.entries[idx].version = globalsArray[3];
    }
  }
  updateFields(selectedElems);
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

document.getElementById("jsonmaker").addEventListener("click", function () {
  if (!objAddGlobals()) { return; }
  let text = JSON.stringify(eObj);
  let filename;
  if (eObj.type == "L3") {  
    filename = "Lower_Thirds_Data_" + formatDate() + "_" + eObj.projNum + ".json";
  } else {
    filename = "Overlays_Data_" + formatDate() + "_" + eObj.jobNum + "_" + eObj.jobName + ".json";
  }
  download(filename, text);
  clearEverything();
}, false);

processBtn.addEventListener('click', function () {
  let txtWin = document.getElementById("textVal");
  let valMsg = "";
  if (!txtWin.validity.valid) { valMsg += "Text Area is required\n"; }
  if (valMsg != "") {
    alert(valMsg);
    return;
  }
  let rawArray = getText();
  processText(rawArray);
  let entryTable = makeTable();
  let container = document.getElementById("tableRow");
  container.innerHTML = entryTable;
  let matches = document.querySelectorAll("td[contenteditable]");
  matches.forEach((txField) => {
    (function () {
      txField.addEventListener("blur", function () { updateObject(txField); }, false);
    }());
  });
  let selAllP = document.getElementById("allP");
  let selNoneP = document.getElementById("noneP");
  let selInvertP = document.getElementById("invertP");
  selAllP.addEventListener('click', function () { allSelectToggle("all"); });
  selNoneP.addEventListener('click', function () { allSelectToggle("none"); });
  selInvertP.addEventListener('click', function () { allSelectToggle("invert"); });
  toggleHidden();
  txtWin.value = "";
});

resetBtn.addEventListener('click', function() {
  document.getElementById("textVal").value = "";
});

clearBtn.addEventListener("click", function () { clearEverything(); });
ovlBtn.addEventListener('click', ovlBtnHandler);
L3Btn.addEventListener('click', ovlBtnHandler);

let allBtn = document.getElementById("applyAllBtn");
allBtn.addEventListener('click', applyBtnHandler);

let slctBtn = document.getElementById("applySelectedBtn");
slctBtn.addEventListener('click', applyBtnHandler);