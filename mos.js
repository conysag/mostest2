Array.prototype.shuffle = function () {
    var i = this.length;
    while (i) {
        var j = Math.floor(Math.random() * i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
}

// invalid enter key
function invalid_enter() {
    if (window.event.keyCode == 13) {
        return false;
    }
}

// start experiment
function start_experiment() {
    // get user name
    var name = document.getElementById("name").value.replace(" ", "_");
    if (name == "") {
        alert("Please enter your name.");
        return false;
    }

    // get setlist number
    var set_num = "0"
    var number = document.getElementsByName("set");
    for (var i = 0; i < number.length; i++) {
        if (number[i].checked) {
            set_num = number[i].value;
        }
    }
    if (set_num == "0") {
        alert("Please press the setlist number button.");
        return false;
    }

    // convert display
    Display();

    var method_paths = [];
    /*
        you have to customize this part
        this is an example which enables each set
        includes different number of methods.
    */
   /*
    if (set_num == "1") {
        method_paths.push(wav_dir + "set" + set_num + "/method1.list");
        method_paths.push(wav_dir + "set" + set_num + "/method2.list");
    } else if (set_num == "2") {
        method_paths.push(wav_dir + "set" + set_num + "/method1.list");
        method_paths.push(wav_dir + "set" + set_num + "/method2.list");
        method_paths.push(wav_dir + "set" + set_num + "/method3.list");
    }
    */
    /*
        or you can write simply as
    */
    method_paths.push("lists/15_lists/list_" + set_num + ".txt");
    // method_paths.push(wav_dir + "set" + set_num + "/method2.list");
    /*
        end
    */

    file_list = makeFileList(method_paths);
    outfile = name + "_set" + set_num + ".csv";
    scores = (new Array(file_list.length)).fill(0);
    elements = (new Array(file_list.length)).fill("");
    finalComment = "";
    eval = document.getElementsByName("eval");
    init();
}

// convert display
function Display() {
    document.getElementById("Display1").style.display = "none";
    document.getElementById("Display2").style.display = "block";
}

// load text file
function loadText(filename) {
    console.log("Loading file: " + filename);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filename, false);
    xhr.send(null);
    
    if (xhr.status !== 200) {
        console.error("Failed to load file: " + filename + ", status: " + xhr.status);
        return [];
    }
    
    var list = xhr.responseText.split(/\r\n|\r|\n/);
    console.log("Raw file content length: " + list.length);
    
    // Remove empty lines
    list = list.filter(function(line) {
        return line.trim() !== "";
    });
    
    console.log("Filtered file content length: " + list.length);
    console.log("First few lines: " + list.slice(0, 3));

    return list;
}

// make file list
function makeFileList(method_paths) {
    var files = [];
    for (var i = 0; i < method_paths.length; i++) {
        console.log("Processing method path: " + method_paths[i]);
        tmp = loadText(method_paths[i]);
        console.log("Loaded " + tmp.length + " files from " + method_paths[i]);
        files = files.concat(tmp);
    }
    console.log("Total files before shuffle: " + files.length);
    files.shuffle();
    console.log("Total files after shuffle: " + files.length);
    return files;
}

function setAudio() {
    document.getElementById("page").textContent = "" + (n + 1) + "/" + scores.length;

    document.getElementById("audio").innerHTML = 'Music:<br>'
        + '<audio src="' + file_list[n]
        + '" controls preload="auto">'
        + '</audio>';
}

function init() {
    n = 0;
    setAudio();
    evalCheck();
    elementsCheck();
    setButton();
}

function evalCheck() {
    const c = scores[n];
    if ((c <= 0) || (c > eval.length)) {
        for (var i = 0; i < eval.length; i++) {
            eval[i].checked = false;
        }
    }
    else {
        eval[c - 1].checked = true;
    }
}



function elementsCheck() {
    // Clear all checkboxes first
    var checkboxes = document.getElementsByName("elements");
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
    
    // Set checkboxes based on saved data
    if (elements[n] !== "") {
        var selectedElements = elements[n].split(",");
        for (var i = 0; i < checkboxes.length; i++) {
            if (selectedElements.includes(checkboxes[i].value)) {
                checkboxes[i].checked = true;
            }
        }
    }
}

function saveElements() {
    var checkboxes = document.getElementsByName("elements");
    var selectedElements = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selectedElements.push(checkboxes[i].value);
        }
    }
    elements[n] = selectedElements.join(",");
}

function setButton() {
    if (n == (scores.length - 1)) {
        document.getElementById("prev").disabled = false;
        document.getElementById("next2").disabled = true;
        document.getElementById("finish").disabled = true;
        for (var i = 0; i < eval.length; i++) {
            if (eval[i].checked) {
                document.getElementById("finish").disabled = false;
                break;
            }
        }
    }
    else {
        if (n == 0) {
            document.getElementById("prev").disabled = true;
        }
        else {
            document.getElementById("prev").disabled = false;
        }
        document.getElementById("next2").disabled = true;
        document.getElementById("finish").disabled = true;
        for (var i = 0; i < eval.length; i++) {
            if (eval[i].checked) {
                document.getElementById("next2").disabled = false;
                break;
            }
        }
    }
}

function evaluation() {
    for (var i = 0; i < eval.length; i++) {
        if (eval[i].checked) {
            scores[n] = i + 1;
        }
    }
    setButton();
}

function exportCSV() {
    var csvData = "File,Score,Elements\n";
    for (var i = 0; i < file_list.length; i++) {
        csvData += "" + file_list[i] + ","
            + scores[i] + ","
            + elements[i] + "\r\n";
    }
    
    // Add final comment as a separate section
    if (finalComment !== "") {
        csvData += "\nFinal Comment,\"" + finalComment.replace(/"/g, '""') + "\"\n";
    }

    // UTF-8 BOM 추가
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvData], { type: "text/csv" });

    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style = "display:none";
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = outfile;
    link.click();
    window.URL.revokeObjectURL(url);
    link.parentNode.removeChild(link);
}

function next() {
    // Save current elements
    saveElements();
    
    n++;
    setAudio();
    evalCheck();
    elementsCheck();
    setButton();
}

function prev() {
    // Save current elements
    saveElements();
    
    n--;
    setAudio();
    evalCheck();
    elementsCheck();
    setButton();
}

function showFinalComment() {
    // Save current elements
    saveElements();
    
    // Hide Display2 and show Display3
    document.getElementById("Display2").style.display = "none";
    document.getElementById("Display3").style.display = "block";
}

function finish() {
    // Save final comment
    finalComment = document.getElementById("finalComment").value;
    
    exportCSV();
}


// directory name
const wav_dir = "wav/";

// invalid enter key
document.onkeypress = invalid_enter();

// global variables
var outfile;
var file_list;
var scores;
var elements;
var finalComment;

// since loadText() doesn't work in local
var n = 0;
var eval = document.getElementsByName("eval");