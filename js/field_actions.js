function myFunction(x) {
  x.classList.toggle("change");
}

function changeText() {
  var x = document.forms["paymentForm"]["fname"].value;
  if (x.length > 0) {
    document.getElementById("fname").style.backgroundImage = "url('../images/active_tick.png')";
  }
  else {
    document.getElementById("fname").style.backgroundImage = "url('../images/dormanttick.png')";
  }
}


function changeTextLname() {
  var x = document.forms["paymentForm"]["lname"].value;
  if (x.length > 0) {
    document.getElementById("lname").style.backgroundImage = "url('../images/active_tick.png')";
  }
  else {
    document.getElementById("lname").style.backgroundImage = "url('../images/dormanttick.png')";
  }
}

function changeCardNumber() {
  var x = document.forms["paymentForm"]["card"].value;
  // document.getElementById("card").innnerHTML = "1234-5678-9012-";
  if (x.length == 19) {
    document.getElementById("card").style.backgroundImage = "url('../images/creditCardActive.png'),url('../images/active_tick.png')";
  }
  else {
    document.getElementById("card").style.backgroundImage = "url('../images/creditCardDormant.png'),url('../images/dormanttick.png')";
  }
}

function changeCVVNumber() {
  var x = document.forms["paymentForm"]["cvv"].value;
  if (x.length == 3) {
    document.getElementById("cvv").style.backgroundImage = "url('../images/cvvActive.png'), url('../images/active_tick.png')";
  }
  else {
    document.getElementById("cvv").style.backgroundImage = "url('../images/cvvDormant.png'),url('../images/dormanttick.png')";
  }
}

function changeDate() {
  var x = document.forms["paymentForm"]["mmyy"].value;
  if (x.length == 5) {
    document.getElementById("mmyy").style.backgroundImage = "url('../images/active_tick.png')";
  }
  else {
    document.getElementById("mmyy").style.backgroundImage = "url('../images/dormanttick.png')";
  }
}

function sendForm() {
  var pan = document.getElementById("card").value
  var amount = document.getElementById("myinput").value
  var date = document.getElementById("mmyy").value
  var cvv = document.getElementById("cvv").value
  var newPan = pan.replace(/-/g, "");
  localStorage.setItem("newPan", newPan);
  var newDate = date.replace(/\//g, "");

  if (amount.length < 1) {
    alert("Invalid amount")
  }
  else if (newPan.length != 16) {
    alert("Invalid Card Number")
  }
  else if (cvv.length != 3) {
    alert("Invalid CVV")
  }
  else if (newDate.length != 4) {
    alert("Invalid Date")
  }

  else {
    var data = JSON.stringify({
      query: "",
      variables: {}
    });

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
      }
    });
    xhr.open("POST", "https://ilhezb32qg.execute-api.eu-west-1.amazonaws.com/dev/Tx/initiate?PAN=" + newPan + "&AMOUNT=" + amount + "&DATE=" + newDate + "&CVV=" + cvv + "&PLATFORM=arn:aws:sns:eu-west-1:627338655066:app/GCM/verinium_gcm_application");
    // xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 0 || (status >= 200 && status < 400)) {
          var txnid = xhr.responseText
          localStorage.setItem("txnid", txnid);
          window.location.href = "../html/payment_processing.html";
        }
        else {
          alert(status)
        }
      }
    }
  }
}


function processPayment() {
  var timer;
  var counter = 0;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = false;
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });
  var pan = localStorage.getItem("newPan")
  try {
    var txnId = localStorage.getItem("txnid")
    txnId = txnId.slice(9, txnId.length - 2);
  }
  catch{
    var redirect = confirm("Invalid Transaction. No Transaction ID. Closing window.");
    if (redirect) {
      window.history.go(-1);
      window.close()
    } else {
      window.history.go(-1);
      window.close()
    }
  }
  timer = setInterval(function () {
    counter = counter + 1
    xhr.open("POST", "https://ilhezb32qg.execute-api.eu-west-1.amazonaws.com/dev/Tx/getState?PAN=" + pan + "&TxID=" + txnId);
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        localStorage.clear()
        var status = xhr.status;
        if ((status === 0 || (status >= 200 && status < 400)) && counter <= 60) {
          // The request has been completed successfully
          var xyz = xhr.responseText;
          var result = xyz.slice(xyz.length - 5, xyz.length - 2)
          if (result != "NOK") {
            clearInterval(timer);
            window.location.href = "../html/payment_success.html";
          }
          else {
            console.log("NOK found. Retrying");
          }
        }
        else {
          clearInterval(timer);
          window.location.href = "../html/payment_failure.html";
        }
      }
    }
    // xhr.send();
  }, 5000);
}

function isNumberKeyOrDecimal(evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode != 46 && charCode > 31
    && (charCode < 48 || charCode > 57))
    return false;
  return true;
}

function isNumberKey(evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode > 31
    && (charCode < 48 || charCode > 57))
    return false;
  return true;
}

function isNumberKeyOrDash(evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode != 45 && charCode > 31
    && (charCode < 48 || charCode > 57))
    return false;
  return true;
}

function isNumberKeyOrSlash(evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode != 47 && charCode > 31
    && (charCode < 48 || charCode > 57))
    return false;
  return true;
}