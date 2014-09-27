// the function called from the shareLink.html (the shareLink.html is the CDN page where the Platform redirects)
// see: https://cloudon.atlassian.net/wiki/display/ARCH/Link+Sharing+and+File+Sharing+Flow+-+Click+On+Emailed+Link

function onLoad() {

  var apiUrl = window.location.getParameter("apiUrl");
  var type = window.location.getParameter("type");
  var linkId = window.location.getParameter("linkId");
  var webappUrl = window.location.getParameter("webappUrl");

  if (!isMobile.any()) {
    if (!webappUrl) {
      webappUrl = "http://www.cloudon.com/app";
    }
    window.location =  webappUrl+
                        "#preview/" +
                        window.location.getParameter("uri") +
                        "/" +
                        window.location.getParameter("filename");
    return;
  }

  // iOS client
  if (isMobile.iOS()) {
  
    // if the app is not installed or does not respond to the custom URL schema
    // redirect in the browser to the landing page after 2 seconds
    setTimeout(function () { redirectToCDN(apiUrl,type,linkId); }, 2000);
    // redirect to the custom URL schema
    window.location = generateViewFileURL(type,linkId);
    return;
  }

  // Android client
  if (isMobile.Android()) {
    redirectToCDN(apiUrl,type,linkId);
    return;
  }

  // on Mobile client, but not on iOS or Android & we're in the sharedLink flow, start downloading the file
  if ("sharedLink" == type) {
    window.location = apiUrl + "/downloadSharedLink?linkId=" + window.location.getParameter("linkId");
    return;
  }

  // on Mobile client, not iOS or Android and we're on the sharedFile flow, show the viewFile.html
  redirectToCDN(apiUrl,type,linkId);
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

// the custom URL schema that will launch the mobile client
function generateViewFileURL(type, linkId) {
  // based on the type this is a shareLink or shareFile flow
  var urlSchema = "cloudon"; // shareLink
  if ("sharedFile" == type) {
    urlSchema = "cloudon-shared"; // shareFile
  }
  var url = urlSchema + "://viewFile?linkId=" + linkId;
  return url;
}

// used to redirect to the viewFile.html on CDN, in case the mobile client does not have the app installed
function redirectToCDN(apiUrl,type,linkId) {
  if (!document.webkithidden) {
    var prodHost = "http://static-cdn1.cloudon.com";
    var devHost = "http://s3.amazonaws.com";
    // depending on where the shareFile redirect comes from, we need to hit the prod or the dev CDN environment
    var hostName = devHost;
    if (apiUrl.indexOf("api.cloudon.com") != -1) {
      hostName = prodHost;
    }
    window.location = hostName + "/shareLink/v1/viewFile.html?apiUrl=" + apiUrl + "&type=" + type + "&linkId=" + linkId;
  }
}

// used from the viewFile.html to set up dynamically the page depending on the mobile client
function configureLinks( ) {
  // Setup the AppStore / Play link
  document.getElementById("appLink").href = appLink.url();
  // Load the correct Badge
  document.getElementById("badge").src = appLink.badgeImageSrc();
  // the download section is hidden, only visible for sharedLink
  document.getElementById("downloadParagraph").style.display = "none";
  var type = window.location.getParameter("type");
  if ("sharedLink" == type || "sharedFile" == type) {
    // the download paragraph is visible
    document.getElementById("downloadParagraph").style.display = "block";
    // Setup the download link
    var apiUrl = decodeURIComponent(window.location.getParameter("apiUrl"));
    var linkId = window.location.getParameter("linkId");
    var downloadLink = apiUrl + "/downloadSharedLink?linkId=" + linkId;
    document.getElementById("fileLink").href = downloadLink;
  }
}