function redirectToCDN() {
  var apiUrl = window.location.getParameter("apiUrl");

  if (!document.webkithidden) {
    // use production CDN url (static-cdn1.cloudon.com) vs. dev CDN url (s3.amazonaws.com)
    var hostName;
    if (apiUrl.indexOf("api.cloudon.com") != -1) {
      // production CDN
      hostName = "http://static-cdn1.cloudon.com";
    }
    else {
      // dev CDN
      hostName = "http://s3.amazonaws.com";
    };
    window.location = hostName + "/shareLink/v1/viewFile.html?apiUrl=" + apiUrl + "&linkId=" + window.location.getParameter("linkId");
  };
}

function onLoad() {
  var apiUrl = window.location.getParameter("apiUrl");

  // Android
  if (isMobile.Android()) {
    if (navigator.userAgent.match(/Mobile/)) {
      // // Jelly Bean with Chrome browser
      // if (navigator.userAgent.match(/Chrome/)) {
      //   setTimeout(redirectToCDN(), 500);
      //   window.location = generateViewFileURL();
      // }
      // // Older Android browser
      // else {
        var iframe = document.createElement("iframe");
        iframe.style.border = "none";
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        var t = setTimeout(redirectToCDN(), 500);
        iframe.onload = function () { clearTimeout(t) };
        iframe.src = generateViewFileURL();
        document.body.appendChild(iframe);
      // }
    }
    else {
      // directly download the file when on Android Tablet
      var downloadLink = decodeURIComponent(apiUrl) + "/downloadSharedLink?linkId=" + window.location.getParameter("linkId");
      document.location = downloadLink;
    }
  }

  // IOS
  else if (isMobile.iOS()) {
    var clickedAt = +new Date;
    window.location = generateViewFileURL();
    !window.document.webkitHidden && setTimeout(function () {
      setTimeout(function () {
        if (+new Date - clickedAt < 2000) {
          // use production CDN url (static-cdn1.cloudon.com) vs. dev CDN url (s3.amazonaws.com)
          var hostName;
          if (apiUrl.indexOf("api.cloudon.com") != -1) {
            // production CDN
            hostName = "http://static-cdn1.cloudon.com";
          }
          else {
            // dev CDN
            hostName = "http://s3.amazonaws.com";
          };
          window.location = hostName + "/shareLink/v1/viewFile.html?apiUrl=" + apiUrl + "&linkId=" + window.location.getParameter("linkId");
        };
      }, 100);
    }, 600);
  }

  // Not mobile
  else {
    // directly download the file when not on iOS or Android
    var downloadLink = apiUrl + "/downloadSharedLink?linkId=" + window.location.getParameter("linkId");
    document.location = downloadLink;
  }
}

var isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function() {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

var appLink = {
  url: function() {
    if (isMobile.Android()) {
      // Linking to Android market place
      // From a web site: http://play.google.com/store/apps/details?id=com.cloudon.client
      // From an Android app: market://details?id=com.cloudon.client

      return "market://details?id=com.cloudon.client";
    }
    else if (isMobile.iOS()) {
      return "itms-apps://itunes.apple.com/app/cloudon/id474025452";
    }
    else if (!isMobile.any()) {
      return "http://www.cloudon.com";
    }
  },

  linkText: function() {
    if (isMobile.Android()) {
      return "Download from Play Store";
    }
    else if (isMobile.iOS()) {
      return "Download from App Store";
    }
    else if (!isMobile.any()) {
      return "View on the web";
    }
  },

  badgeImageSrc: function() {
    if (isMobile.Android()) {
      return "img/Google_Play_Badge@2x.png";
    }
    else if (isMobile.iOS()) {
      return "img/App_Store_Badge@2x.png";
    }
    else if (!isMobile.any()) {
      return "";
    }
  }
};

if (!window.location.getParameter) {
  window.location.getParameter = function(key) {
    function parseParams() {
      var params = {},
        e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.search.substring(1);

      while (e = r.exec(q)) {
        params[d(e[1])] = d(e[2]);
      }

      return params;
    }

    if (!this.queryStringParams) {
      this.queryStringParams = parseParams();
    }

    return this.queryStringParams[key];
  };
}

function generateViewFileURL() {
  var paramName = "linkId";
  var paramValue = window.location.getParameter(paramName);
  var url = "cloudon://viewFile?" + paramName + "=" + paramValue;
  return url;
}

function configureLinks() {
  // Setup the AppStore / Play link
  document.getElementById("appLink").href = appLink.url();

  // Load the correct Badge
  document.getElementById("badge").src = appLink.badgeImageSrc();

  // // Setup the filename
  // if (window.location.getParameter("filename")) {
  //   document.getElementById("filename").innerHTML = window.location.getParameter("filename");
  // };

  // // Setup the sender
  // if (window.location.getParameter("sender")) {
  //   document.getElementById("sender").innerHTML = window.location.getParameter("sender");
  // };

  // Setup the download link
  var apiUrl = decodeURIComponent(window.location.getParameter("apiUrl"));
  var linkId = window.location.getParameter("linkId");
  var downloadLink = apiUrl + "/downloadSharedLink?linkId=" + linkId;
  document.getElementById("fileLink").href = downloadLink;
}
