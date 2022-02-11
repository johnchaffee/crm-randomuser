// Display Login/Logout link in nav
$(document).ready(function () {
  $("#loginNav").ready(function () {
    console.log("#loginNav");
    updateLoginNav();
  });
});

// Display login or username (logout) link in nav
function updateLoginNav() {
  $("#loginNav").ready(function () {
    console.log("updateLoginNav");
    if (session != "" && session != null) {
      console.log("#updateLoginNav: User is logged in. Display Logout link.");
      $("#loginNav").html('<a class="nav-link" href="">Logout</a>');
    } else {
      console.log("#updateLoginNav: User is logged out. Hide Logout link.");
      $("#loginNav").html(
        '<a class="nav-link" data-toggle="modal" data-target="#loginModal" href="#"></a>'
      );
      // console.log("#updateLoginNav: User is logged out. Display Login link.");
      // $("#loginNav").html(
      //   '<a class="nav-link" data-toggle="modal" data-target="#loginModal" href="#">Login</a>'
      // );
    }
  });
}

// Login or logout when clicked in nav
$(document).ready(function () {
  $("#loginNav").click(function () {
    console.log("#loginNav clicked");
    if (session != "" && session != null) {
      console.log("#loginNav: User is logged in. Logging them out.");
      // TODO Call user/logout here to destroy session key on server; is this necessary?
      deleteCookie("session");
    } else {
      console.log("#loginNav: User is logged out. Take them to Login page.");
    }
  });
});
// END NAV LINKS

// PRISM SYNTAX HIGHLIGHTING
// Display syntax highlighted json results
function displayJsonResponse(response) {
  $("#api-response").ready(function () {
    if ($("#api-response").length) {
      $("#api-response").text(
        status + "\n" + JSON.stringify(response, undefined, 2)
      );
      $("#json-response").hide();
      $("#json-response").removeClass("d-none");
      $("#json-response").fadeIn("slow");
      Prism.highlightElement($("#api-response")[0]);
      // $('html, body').animate({
      //     scrollTop: ($('#json-response').offset().top)
      // }, 1000);
      console.log(
        "displayJsonResponse: update json text element, unhide, apply syntax highlighting."
      );
    }
  });
}
// END PRISM SYNTAX HIGHLIGHTING

// PHONE NUMBER FORMATTING
// Remove spaces from phone number string (or any string)
function removeSpaces(str) {
  let noSpaces = str.replace(/\s/g, "");
  return noSpaces;
}

// Pass raw phone number and get back formatted phone number
// Assumes input is either a 10-digit US number or US E164 number
// Example: formatNumber("+1(206) 555.1212");
function formatNumber(str) {
  // split string into an array
  let arr = str.split("");
  let newNumber = "";
  // Loop through each char, if it's a digit add it to the newNumber string
  arr.forEach((char) => {
    let num = parseInt(char);
    if (Number(num) >= 0) {
      newNumber += char;
    }
  });
  // If there are 11 digits and first one is a '1' strip off the '1'
  if (newNumber.length === 11 && newNumber.slice(0, 1) === "1") {
    newNumber = newNumber.slice(1);
  }
  // if there are 10 digits, assume it's a US number and reformat it
  if (newNumber.length === 10) {
    let areacode = newNumber.slice(0, 3);
    let prefix = newNumber.slice(3, 6);
    let suffix = newNumber.slice(6, 10);
    newNumber = "(" + areacode + ") " + prefix + "-" + suffix;
  }
  // return the newNumber string in whatever shape it's in
  return newNumber;
}
// END PHONE NUMBER FORMATTING FUNCTIONS

// MESSAGE SEND
function messageSend(sessionKey, phoneNumber, messageBody) {
  if (!sessionKey) {
    alert("Missing session key. Please login first.");
    return;
  } else if (!phoneNumber) {
    alert("Please enter a phone number.");
    return;
  } else if (!messageBody) {
    alert("Please enter a message body.");
    return;
  }
  // FETCH
  const apiUrl =
    "https://api.zipwhip.com/message/send";
  // url encode body params
  const bodyParams = new URLSearchParams({
    session: sessionKey,
    contacts: phoneNumber,
    body: messageBody,
  });
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams,
  };
  fetch(apiUrl, requestOptions)
    // .then((response) => response.text())
    .then((response) => response.json())
    .then((result) => {
      console.log("SUCCESS");
      console.log("result.success: " + result.success);
      console.log("result: " + JSON.stringify(result, undefined, 2));
      if (result.success == true) {
        console.log("Message sent");
        $("#success-alert").fadeIn("slow");
      } else {
        // status == sucess, but result.success == false
        alert(result.response.desc);
        console.log("else: " + result.response.desc);
      }
      displayJsonResponse(result);
    })
    .catch((error) => {
      console.log("CATCH");
      console.log(
        ".catch JSON.stringify(error, undefined, 2): \n" +
          JSON.stringify(error, undefined, 2)
      );
      $("#failed-alert").fadeIn("slow");
      console.log("error", error);
      displayJsonResponse(error);
    })
    .finally(() => {
      console.log("FINALLY");
      $("#submit").attr("disabled", false);
    });
  // END FETCH
}
// END MESSAGE SEND

// CRM GROUP MESSAGING FUNCTIONS
// Functions for building deep links and widget
function encodeUrlParams(numAndName, messageBody) {
  let encodedUrlParams = encodeURI(numAndName);
  if (messageBody) {
    encodedUrlParams += encodeURI("?body=" + messageBody);
  }
  return encodedUrlParams;
}

function deeplinkHref(numberAndName, messageBody) {
  let href =
    "https://app.zipwhip.com/messaging/" +
    encodeUrlParams(numberAndName, messageBody);
  // console.log("deeplinkHref: " + href);
  // TODO: This is a temporary mobile deeplink implementation until it is supported using Universal Links using a standard http deeplink URL
  let isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
  let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isSafari && iOS) {
    href = "zipwhip://messaging/" + encodeUrlParams(numberAndName, messageBody);
  }
  return href;
}

function openWidgetHref(numberAndName, messageBody) {
  let href =
    "'https://embed.zipwhip.com/messaging/" +
    encodeUrlParams(numberAndName, messageBody) +
    "'";
  // console.log("openWidgetHref: " + href);
  return href;
}

// Widget Window settings
let windowName = "_blank";
let windowWidth = "400";
let windowHeight = "600";
let windowTop = "200";
let windowCenter = window.innerWidth / 2 + window.screenLeft;
// console.log("windowCenter: " + windowCenter);
let windowLeft = windowCenter - windowWidth / 2;
// console.log("windowLeft: " + windowLeft);
let windowSpecs = `width=${windowWidth}px,height=${windowHeight}px,top=${windowTop},left=${windowLeft}`;

// Send group Messages via API
function sendGroupMessage(mobileNumbers, myMessage) {
  const numbers = mobileNumbers.split(",");
  // can send to > 50 recipients if sent individually in a loop
  // Pre-validate session and body before sending to messageSend function
  if (!session) {
    alert("Missing session key. Please login first.");
    return;
  } else if (!myMessage) {
    alert("Please enter a message body.");
    return;
  }
  numbers.forEach((number) => {
    messageSend(session, number, myMessage);
  });
}
// END CRM FUNCTIONS

// COOKIES
// Store session key in cookie
let username = getCookie("username");
let session = getCookie("session");

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  let d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toGMTString();
  // If testing on localhost, use SameSite=Lax
  if (location.protocol == "https:") {
    document.cookie = `${cname}=${cvalue}; ${expires}; path=/; SameSite=None; Secure`;
  } else {
    document.cookie = `${cname}=${cvalue}; ${expires}; path=/; SameSite=Lax`;
  }
  console.log("setCookie: " + `${cname}=${cvalue};`);
}

function deleteCookie(cname) {
  console.log("function deleteCookie");
  // If testing on localhost, use SameSite=Lax
  if (location.protocol == "https:") {
    document.cookie = `${cname}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure`;
  } else {
    document.cookie = `${cname}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  }
}

function checkCookie() {
  if (session != "" && session != null && username != "" && username != null) {
    console.log("You are logged in as: " + username);
    console.log("Your session key is: " + session);
    return true;
  } else {
    console.log("You are not logged in");
    return false;
  }
}

function updateSessionField() {
  checkCookie();
  console.log("checkCookie");
  // Set session field from cookie
  $("#session").val(session);
  // $('#swagger-ui [data-property-name="session"] input[type="text"]').val(session);
  console.log("set session value");
  // Set username field from cookie
  $("#username").val(username);
}

// Get session key from cookie and store it in session field
$(document).ready(function () {
  $("#session").ready(function () {
    console.log("#session.ready");
    updateSessionField();
  });
});
// END COOOKIES

// BUILD DYNAMIC DEEPLINKS FOR DEEPLINK DEMO AND WIDGET DEMO
function buildLinks(domain) {
  let base =
    "https://" + domain + ".zipwhip.com/";
  console.log("BASE: " + base);
  let deeplink = base;
  console.log("DEEPLINK: " + deeplink);
  let code = "&lt;a href=&quot;" + deeplink + "&quot;&gt;Try it&lt;/a&gt;";
  let popupCode =
    "&lt;a href=\"javascript:window.open('" +
    deeplink +
    "', '" +
    windowName +
    "', '" +
    windowSpecs +
    "')\"&gt;Open Popup Widget&lt;/a&gt";
  let num = $("#phone").val();
  let name = $("#name").val();
  let body = $("#body").val();
  let session = $("#session").val();
  let sso = $("#sso").val();
  let path = "";
  let paramCount = 0;
  // On Deeplinks Builder page or Widget Builder page with Conversation Component checked
  // Create path to /messaging/phoneNumber + other params
  if (
    window.location.pathname == "/deeplinks/builder/" ||
    (window.location.pathname == "/widget/builder/" &&
      $("#conversation-component-checkbox").is(":checked"))
  ) {
    path = "messaging/";
    if (num) {
      // remove spaces from phone number
      path += removeSpaces(num);
      if (name) {
        // strip spaces surrounding name
        path += " " + name.trim();
        // Enable Overwrite Name checkbox
        $("#overwrite-checkbox").removeAttr("disabled");
        // add overwrite param if checked
        if ($("#overwrite-checkbox").is(":checked")) {
          if (paramCount > 0) {
            path += "&overwrite=true";
          } else {
            path += "?overwrite=true";
          }
          paramCount += 1;
        }
      } else {
        // No name, disable overwrite-checkbox
        $("#overwrite-checkbox").attr("disabled", true);
      }
      // add body param if exists
      if (body) {
        if (paramCount > 0) {
          path += "&body=" + body;
        } else {
          path += "?body=" + body;
        }
        paramCount += 1;
      }
      // Show/Hide Contact Header
      $("#contact-header-checkbox").removeAttr("disabled");
      if ($("#contact-header-checkbox").is(":checked")) {
        // default
        // Enable Inbox checkbox
        $("#inbox-nav-checkbox").removeAttr("disabled");
        if ($("#inbox-nav-checkbox").is(":checked")) {
          // default
        } else {
          if (paramCount > 0) {
            path += "&inbox=false";
          } else {
            path += "?inbox=false";
          }
          paramCount += 1;
        }
      } else {
        $("#inbox-nav-checkbox").attr("disabled", true);
        if (window.location.pathname == "/widget/builder/") {
          // contactHeader param only applies to Widget, not deeplinks
          if (paramCount > 0) {
            path += "&contactHeader=false";
          } else {
            path += "?contactHeader=false";
          }
          paramCount += 1;  
        }
      }
    } else {
      // No number, disable inbox-checkbox and overwrite-checkbox
      $("#contact-header-checkbox").attr("disabled", true);
      $("#inbox-nav-checkbox").attr("disabled", true);
      $("#overwrite-checkbox").attr("disabled", true);
    }
  }
  // show conversation params if Conversation radio is checked
  if ($("#conversation-component-checkbox").is(":checked")) {
    $(".conversation-param").show();
  } else {
    $(".conversation-param").hide();
  }
  if (window.location.pathname == "/widget/builder/") {
    // Settings Header
    if ($("#settings-header-checkbox").is(":checked")) {
      $("#settings-menu-checkbox").attr("disabled", false);
      $("#switchboard-checkbox").attr("disabled", false);
      if ($("#settings-menu-checkbox").is(":checked")) {
        // default
      } else {
        if (paramCount > 0) {
          path += "&settingsMenu=false";
        } else {
          path += "?settingsMenu=false";
        }
        paramCount += 1;
      }
      if ($("#switchboard-checkbox").is(":checked")) {
        // default
      } else {
        if (paramCount > 0) {
          path += "&switchboard=false";
        } else {
          path += "?switchboard=false";
        }
        paramCount += 1;
      }
    } else {
      $("#settings-menu-checkbox").attr("disabled", true);
      $("#switchboard-checkbox").attr("disabled", true);
      if (paramCount > 0) {
        path += "&settingsHeader=false";
      } else {
        path += "?settingsHeader=false";
      }
      paramCount += 1;
    }
  }
  // Footer
  if ($("#footer-checkbox").is(":checked")) {
    if (paramCount > 0) {
      path += "&footer=true";
    } else {
      path += "?footer=true";
    }
    paramCount += 1;
  }
  // show sso field and add sso param if checked
  if ($("#sso-checkbox").is(":checked")) {
    if (paramCount > 0) {
      path += "&connection=" + sso;
    } else {
      path += "?connection=" + sso;
    }
    paramCount += 1;
    $("#sso-row").show();
  } else {
    $("#sso-row").hide();
  }
  // show session field and change base url if checked
  if ($("#session-checkbox").is(":checked")) {
    $("#session-row").show();
    base =
      "https://" +
      domain +
      ".zipwhip.com/v2/deeplink/" +
      session +
      "?path=/";
  } else {
    $("#session-row").hide();
    base =
      "https://" + domain + ".zipwhip.com/";
  }
  // create url encoded deep link
  deeplink = base + encodeURI(path);
  console.log("DEEPLINK: " + deeplink);
  // Update all submit button hrefs with new deeplink
  $("#submit-deeplink").attr("href", deeplink);
  $("#submit-embed").attr("href", deeplink);
  $("#submit-popup").attr(
    "href",
    "javascript:window.open('" +
      deeplink +
      "','" +
      windowName +
      "','" +
      windowSpecs +
      "')"
  );
  $("#submit-panel").attr(
    "href",
    'javascript:onclick=togglePanel("' + deeplink + '")'
  );
  $("#panel-icon").attr(
    "href",
    'javascript:onclick=togglePanel("' + deeplink + '")'
  );
  prismCode(domain, deeplink);
  $("#submit-embed").click(function (event) {
    console.log("SUBMIT deeplink: " + deeplink);
    event.preventDefault();
    $("#widget").attr("src", deeplink);
  });
  // $("input").blur(function() {
  //     console.log("INPUT BLUR");
  //     $("#widget").attr("src", deeplink);
  // });
}

// Update the sample code and prism syntax highlighting
function prismCode(domain, deeplink) {
  if (domain === "app") {
    code = "&lt;a href=&quot;" + deeplink + "&quot;&gt;Try it&lt;/a&gt;";
  } else if (domain === "embed") {
    code =
      '&lt;iframe src="' +
      deeplink +
      '" width="400px" height="600px"&gt;&lt;/iframe&gt;';
    popupCode =
      "&lt;a href=\"javascript:window.open('" +
      deeplink +
      "', '" +
      windowName +
      "', '" +
      windowSpecs +
      "')\"&gt;Open Popup Widget&lt;/a&gt";
    $("#popup-code").html(popupCode);
    Prism.highlightElement($("#popup-code")[0]);
  }
  $("#prism-code").html(code);
  Prism.highlightElement($("#prism-code")[0]);
}
// END DYNAMIC DEEPLINKS

// CLOSE ALERTS
$("#close-alert").click(function () {
  $(".alert").fadeOut("fast");
});

console.log("Done loading scripts.js");
